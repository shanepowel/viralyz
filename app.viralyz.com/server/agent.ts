/**
 * Autopilot agent runtime.
 *
 * Wraps the existing AI tools as OpenAI tool-calls so the model can plan
 * end-to-end: ideate → draft → score → refine → pick slot → request approval
 * → schedule → post → measure. The runtime is idempotent: each step writes a
 * `mission_steps` row before executing, so restarts pick up where they left off.
 *
 * v0 always pauses at the human-approval gate. The mission's `approvalMode`
 * column is reserved for a future release — even when set to "auto" the
 * runtime still requires an explicit user click to approve before posting.
 */
import OpenAI from "openai";
import { db } from "./db";
import { and, asc, desc, eq, gte, isNull, lte, or } from "drizzle-orm";
import {
  missions,
  missionRuns,
  missionSteps,
  missionAudit,
  missionApprovals,
  missionArtifacts,
  learningEvents,
  contentAnalyses,
  users,
  type Mission,
  type MissionRun,
  type MissionStep,
  type ProposedIdea,
} from "@shared/schema";
import { generateIdeas, generateHooks, rewriteCaption, type BrandVoiceContext } from "./ai-tools";
import { analyzeContent, decrementUserCredits } from "./analysis";
import { getDefaultBrandVoice, getBrandVoiceProfile, createNotification } from "./storage-extras";
import { computeHeatmap, normalizeNiche, normalizePlatform } from "./insights";
import {
  getConnectionForPlatform,
  postToPlatform,
  fetchPostStatsForPlatform,
  isPlatformConfigured,
  type PlatformId,
} from "./integrations";
// findRecentPostByText is the LinkedIn-specific lookup-recovery helper used
// by publishRun's idempotency reconciler; getConnectionForUser is retained
// for the same path. Other LinkedIn helpers are now reached via the
// dispatcher above.
import { getConnectionForUser, findRecentPostByText } from "./integrations/linkedin";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MEASURE_DELAY_MS = 24 * HOUR_MS;
const DAILY_POST_CAP = 1; // per platform per user per day

function log(msg: string) {
  const t = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  console.log(`${t} [agent] ${msg}`);
}

async function audit(args: {
  userId: string;
  missionId?: string | null;
  runId?: string | null;
  event: string;
  meta?: any;
}) {
  await db.insert(missionAudit).values({
    userId: args.userId,
    missionId: args.missionId ?? null,
    runId: args.runId ?? null,
    event: args.event,
    meta: args.meta ?? null,
  });
}

/**
 * OpenAI tool-calling loop: ask the model to critique a draft and, if it
 * wants to, call `rewrite_caption` to produce a refined version. Records
 * a `critique` step (always) and a `refine` step (only when the model
 * actually invokes a tool), so the inspector reflects the model's reasoning.
 */
async function critiqueAndRefine(args: {
  runId: string;
  ord: number;
  draft: string;
  hook: string;
  platform: string;
  brandVoice: BrandVoiceContext | null;
  goal: string;
}): Promise<{ refinedText: string | null; nextOrd: number }> {
  let ord = args.ord;
  const tools = [
    {
      type: "function" as const,
      function: {
        name: "rewrite_caption",
        description: "Rewrite the entire post text. Use sparingly — only when the critique surfaces a concrete improvement.",
        parameters: {
          type: "object",
          properties: { instruction: { type: "string", description: "What to change in plain English." } },
          required: ["instruction"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "tighten_hook",
        description: "Replace just the opening hook line with a stronger one (keep body unchanged).",
        parameters: {
          type: "object",
          properties: { reason: { type: "string" } },
          required: ["reason"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "approve_as_is",
        description: "The draft is good enough. Skip refinement.",
        parameters: { type: "object", properties: { reason: { type: "string" } }, required: ["reason"] },
      },
    },
  ];
  const sys = `You are a senior ${args.platform} editor. Critique the draft against the mission goal in 2 short bullets, then call exactly one tool. Be honest — most drafts don't need rewriting.`;
  const user = `Goal: ${args.goal}\nHook: ${args.hook}\n\nDraft:\n${args.draft}`;
  let critiqueText = "";
  let toolName: string | null = null;
  let toolArg: any = null;
  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: sys }, { role: "user", content: user }],
      tools,
      tool_choice: "required",
      temperature: 0.4,
    });
    const msg = resp.choices[0]?.message;
    critiqueText = msg?.content || "";
    const call: any = msg?.tool_calls?.[0];
    if (call?.function?.name) {
      toolName = call.function.name as string;
      try { toolArg = JSON.parse(call.function.arguments || "{}"); } catch { toolArg = {}; }
    }
  } catch (e: any) {
    await pushStep({
      runId: args.runId, ord: ord++, kind: "critique", toolCall: "openai.tool_loop",
      input: { goal: args.goal }, output: { error: String(e?.message || e) },
    });
    return { refinedText: null, nextOrd: ord };
  }
  await pushStep({
    runId: args.runId, ord: ord++, kind: "critique", toolCall: "openai.tool_loop",
    input: { goal: args.goal },
    output: { critique: critiqueText, decision: toolName, arg: toolArg },
    creditCost: 1,
  });
  if (!toolName || toolName === "approve_as_is") {
    return { refinedText: null, nextOrd: ord };
  }
  // Execute the requested tool. We constrain to known-safe operations.
  let refinedText: string | null = null;
  try {
    if (toolName === "rewrite_caption") {
      const instruction = String(toolArg?.instruction || "Tighten and clarify");
      const r = await rewriteCaption(`${args.draft}\n\nEditor note: ${instruction}`, args.platform, args.brandVoice);
      refinedText = r.rewrittenCaption || null;
    } else if (toolName === "tighten_hook") {
      const hooks = await generateHooks(args.goal, args.platform, "professional network", args.brandVoice);
      const newHook = hooks.hooks[hooks.bestHookIndex]?.text;
      if (newHook) {
        const lines = args.draft.split(/\n/);
        lines[0] = newHook;
        refinedText = lines.join("\n");
      }
    }
  } catch (e: any) {
    await pushStep({
      runId: args.runId, ord: ord++, kind: "refine", toolCall: toolName,
      input: toolArg, output: { error: String(e?.message || e) },
    });
    return { refinedText: null, nextOrd: ord };
  }
  await pushStep({
    runId: args.runId, ord: ord++, kind: "refine", toolCall: toolName,
    input: toolArg,
    output: { refinedTextLength: refinedText?.length ?? 0, refinedText, applied: !!refinedText },
    creditCost: 1,
  });
  // Mirror the refined text onto the critique step so a single rehydration
  // path (`critiqueOut.refinedText`) recovers it after a restart.
  if (refinedText) {
    await db
      .update(missionSteps)
      .set({ output: { critique: critiqueText, decision: toolName, arg: toolArg, refinedText } })
      .where(and(eq(missionSteps.runId, args.runId), eq(missionSteps.kind, "critique")));
  }
  return { refinedText, nextOrd: ord };
}

/**
 * Resolve the BrandVoiceContext to use for a mission's prompts.
 * Priority: explicit `brandVoiceProfileId` → user's default profile →
 * built-in `tonePreset` (synthetic context) → null. The mission-level
 * `useBrandVoice` flag still controls whether *any* voice is applied.
 */
const TONE_PRESET_BLURBS: Record<string, { tone: string; doRules: string[]; dontRules: string[] }> = {
  authoritative: {
    tone: "Confident, measured, expert. Concrete claims backed by experience.",
    doRules: ["Open with a strong opinion", "Cite a real number or example", "End with a clear takeaway"],
    dontRules: ["Hedge with 'maybe' or 'I think'", "Use marketing fluff", "Stack hashtags"],
  },
  playful: {
    tone: "Witty, warm, conversational. Light wordplay and self-aware humour.",
    doRules: ["Lead with a hook that smiles", "Keep paragraphs to 1-2 lines"],
    dontRules: ["Be sarcastic about the audience", "Use emojis as filler"],
  },
  story: {
    tone: "First-person narrative. Specific scenes, real names, payoff at the end.",
    doRules: ["Open with a moment in time", "Show, don't tell", "Land on the lesson"],
    dontRules: ["Skip the setup", "Bury the point past line 5"],
  },
  contrarian: {
    tone: "Bold, debate-starting, but evidence-led. Names a sacred cow and challenges it.",
    doRules: ["State the unpopular take in line 1", "Back it with one piece of proof"],
    dontRules: ["Punch down", "Pick a fight without evidence"],
  },
  data: {
    tone: "Analytical, crisp, numerate. Every claim ties to a number or chart.",
    doRules: ["Lead with the headline metric", "Define the time window"],
    dontRules: ["Use vanity metrics without context", "Round so much the point is lost"],
  },
};

async function resolveMissionBrandVoice(mission: Mission): Promise<BrandVoiceContext | null> {
  if (!mission.useBrandVoice) return null;
  if (mission.brandVoiceProfileId) {
    const explicit = await getBrandVoiceProfile(mission.brandVoiceProfileId, mission.userId);
    if (explicit) return explicit as unknown as BrandVoiceContext;
  }
  const def = await getDefaultBrandVoice(mission.userId);
  if (def) return def as unknown as BrandVoiceContext;
  if (mission.tonePreset && TONE_PRESET_BLURBS[mission.tonePreset]) {
    const p = TONE_PRESET_BLURBS[mission.tonePreset];
    return {
      name: `Preset: ${mission.tonePreset}`,
      toneSummary: p.tone,
      doRules: p.doRules,
      dontRules: p.dontRules,
    } satisfies BrandVoiceContext;
  }
  return null;
}

async function setRun(runId: string, patch: Partial<MissionRun>) {
  await db
    .update(missionRuns)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(missionRuns.id, runId));
}

async function pushStep(args: {
  runId: string;
  ord: number;
  kind: string;
  status?: string;
  toolCall?: string;
  input?: any;
  output?: any;
  error?: string;
  reasoning?: string;
  tokenCost?: number;
  creditCost?: number;
}): Promise<MissionStep> {
  // Rough cost heuristics so the timeline shows token/credit metering even
  // when upstream tools don't surface usage. Tools that *do* know their own
  // cost can pass it explicitly via tokenCost/creditCost.
  const llmKinds = new Set(["ideate", "hooks", "draft", "score"]);
  const tokenCost = args.tokenCost ?? (llmKinds.has(args.kind) ? 600 : 0);
  const creditCost = args.creditCost ?? (llmKinds.has(args.kind) ? 1 : 0);
  const reasoning = args.reasoning ?? (
    args.kind === "ideate" ? "Asked the model for 4 candidate angles based on the brief and (when present) regeneration feedback." :
    args.kind === "hooks" ? "Asked the model for 5 hook variants for the chosen idea and picked the highest-scoring one." :
    args.kind === "draft" ? "Rewrote the seed into a polished, on-brand caption." :
    args.kind === "score" ? "Ran the pre-publish viral scorer to predict reach." :
    args.kind === "pickSlot" ? "Computed the engagement heatmap and picked the next best slot." :
    args.kind === "post" ? "Published the approved draft via the platform's publish API." :
    args.kind === "measure" ? "Pulled real engagement 24h after posting and wrote a learning event." :
    args.kind === "awaitIdea" ? "Pausing for human input — pick which angle to draft." :
    args.kind === "awaitApproval" ? "Pausing for human approval — final sign-off before publishing." :
    null
  ) as string | null;

  const [row] = await db
    .insert(missionSteps)
    .values({
      runId: args.runId,
      ord: args.ord,
      kind: args.kind,
      status: args.status ?? "done",
      toolCall: args.toolCall ?? null,
      input: args.input ?? null,
      output: args.output ?? null,
      error: args.error ?? null,
      reasoning: reasoning ?? null,
      tokenCost,
      creditCost,
      startedAt: new Date(),
      finishedAt: new Date(),
    })
    .returning();
  return row;
}

export async function loadRunWithSteps(runId: string) {
  const [run] = await db.select().from(missionRuns).where(eq(missionRuns.id, runId));
  if (!run) return null;
  const steps = await db
    .select()
    .from(missionSteps)
    .where(eq(missionSteps.runId, runId))
    .orderBy(asc(missionSteps.ord));
  return { run, steps };
}

/**
 * Has the user already posted today on this platform?
 * Used to enforce the daily safety cap.
 */
function dailyCapForUser(userId: string, _platform: string): number {
  // Hook for per-user/platform overrides (e.g. plan-based or admin-set).
  // Today this is a single global cap, but the dispatch keeps the call site
  // platform-aware so multi-platform v1 only changes this function.
  const override = process.env[`AUTOPILOT_DAILY_CAP_${userId}`];
  if (override && Number.isFinite(Number(override))) return Number(override);
  return DAILY_POST_CAP;
}

async function dailyCapReached(userId: string, platform: string): Promise<boolean> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + DAY_MS);
  // Count only posts on the *same* platform so a LinkedIn post doesn't block
  // a Twitter post once we add more platforms.
  const rows = await db
    .select({ id: missionRuns.id })
    .from(missionRuns)
    .innerJoin(missions, eq(missions.id, missionRuns.missionId))
    .where(
      and(
        eq(missionRuns.userId, userId),
        eq(missions.platform, platform),
        gte(missionRuns.postedAt, start),
        lte(missionRuns.postedAt, end),
      ),
    );
  return rows.length >= dailyCapForUser(userId, platform);
}

/**
 * Phase 1a — Generate candidate ideas. Leaves the run in `awaiting_idea`
 * with proposed ideas serialized into missionRuns.proposedIdeas. The user
 * (or autopilot's auto-pick path) picks one to advance to drafting.
 */
export async function proposeIdeasForRun(runId: string): Promise<MissionRun> {
  // Idempotency guard: if a step already exists for this run we've started
  // (or finished) the work in a prior process; bail out so a tick after a
  // restart doesn't double-charge the model or duplicate audit events.
  const prior = await db
    .select({ id: missionSteps.id })
    .from(missionSteps)
    .where(and(eq(missionSteps.runId, runId), eq(missionSteps.kind, "ideate")))
    .limit(1);
  if (prior.length) {
    // Reconcile partial writes: if the ideate step finished but the run row
    // never got `proposedIdeas` / `awaiting_idea` (server crash between
    // pushStep and setRun), rehydrate from the step's persisted output.
    const [existing] = await db.select().from(missionRuns).where(eq(missionRuns.id, runId));
    if (existing && (!existing.proposedIdeas || !existing.proposedIdeas.length)) {
      const [step] = await db
        .select()
        .from(missionSteps)
        .where(and(eq(missionSteps.runId, runId), eq(missionSteps.kind, "ideate")))
        .limit(1);
      const ideas = (step?.output as any)?.ideas as ProposedIdea[] | undefined;
      if (ideas?.length) {
        await setRun(runId, { status: "awaiting_idea", proposedIdeas: ideas });
        const [hydrated] = await db.select().from(missionRuns).where(eq(missionRuns.id, runId));
        return hydrated;
      }
    }
    return existing;
  }
  const [run] = await db.select().from(missionRuns).where(eq(missionRuns.id, runId));
  if (!run) throw new Error("run-not-found");
  const [mission] = await db.select().from(missions).where(eq(missions.id, run.missionId));
  if (!mission) throw new Error("mission-not-found");

  await setRun(runId, { status: "running" });
  await audit({ userId: run.userId, missionId: mission.id, runId, event: "ideate.start" });

  try {
    const brandVoice = await resolveMissionBrandVoice(mission);

    const feedback = run.regenerationFeedback ? `User feedback from previous attempt: ${run.regenerationFeedback}\n\n` : "";
    const ideas = await generateIdeas(
      `${feedback}${mission.brief.slice(0, 200)}`,
      mission.platform,
      "",
      4,
      brandVoice,
    );
    if (!ideas.length) throw new Error("no-ideas-generated");

    // Persist the full ideas list (not just titles) so a crash between
    // here and the setRun below can be recovered by re-reading the step.
    await pushStep({
      runId, ord: 0, kind: "ideate", toolCall: "generateIdeas",
      input: { brief: mission.brief, platform: mission.platform, feedback: run.regenerationFeedback || null },
      output: { count: ideas.length, titles: ideas.map((i) => i.title), ideas },
    });
    await pushStep({
      runId, ord: 1, kind: "awaitIdea",
      output: { gate: "user picks one of N ideas", count: ideas.length },
    });

    await setRun(runId, {
      status: "awaiting_idea",
      proposedIdeas: ideas,
    });
    await audit({ userId: run.userId, missionId: mission.id, runId, event: "ideate.ready", meta: { count: ideas.length } });

    const [updated] = await db.select().from(missionRuns).where(eq(missionRuns.id, runId));
    return updated;
  } catch (err: any) {
    log(`propose ideas failed for run=${runId}: ${err?.message || err}`);
    await pushStep({ runId, ord: 0, kind: "ideate", status: "failed", error: String(err?.message || err) });
    await setRun(runId, { status: "failed", error: String(err?.message || err) });
    await audit({ userId: run.userId, missionId: mission.id, runId, event: "ideate.error", meta: { error: String(err?.message || err) } });
    throw err;
  }
}

/**
 * Phase 1b (handler-side) — Records the user's idea pick and queues the
 * draft pipeline as `pending_draft`. The HTTP handler does no long work;
 * the scheduler tick picks the row up and runs `executeDraftPipeline`.
 */
export async function selectIdeaForRun(runId: string, ideaIndex: number): Promise<MissionRun> {
  const [run] = await db.select().from(missionRuns).where(eq(missionRuns.id, runId));
  if (!run) throw new Error("run-not-found");
  if (!["awaiting_idea", "pending_draft", "running"].includes(run.status)) {
    throw new Error(`cannot-select-idea-from-${run.status}`);
  }
  const [mission] = await db.select().from(missions).where(eq(missions.id, run.missionId));
  if (!mission) throw new Error("mission-not-found");
  const ideas = run.proposedIdeas ?? [];
  const chosen = ideas[ideaIndex];
  if (!chosen) throw new Error("invalid-idea-index");

  if (run.status === "awaiting_idea") {
    await setRun(runId, { status: "pending_draft", selectedIdeaIndex: ideaIndex });
    await audit({ userId: run.userId, missionId: mission.id, runId, event: "idea.selected", meta: { index: ideaIndex, title: chosen.title } });
  }
  const [updated] = await db.select().from(missionRuns).where(eq(missionRuns.id, runId));
  return updated;
}

/**
 * Tick-side worker for the draft pipeline. Idempotent per step — if a step
 * with the given `kind` already exists for this run we re-use its persisted
 * output instead of re-issuing the model call. Safe to retry after restarts.
 */
export async function executeDraftPipeline(runId: string): Promise<MissionRun> {
  const [run] = await db.select().from(missionRuns).where(eq(missionRuns.id, runId));
  if (!run) throw new Error("run-not-found");
  if (!["pending_draft", "running"].includes(run.status)) return run;
  const [mission] = await db.select().from(missions).where(eq(missions.id, run.missionId));
  if (!mission) throw new Error("mission-not-found");
  const ideas = run.proposedIdeas ?? [];
  const ideaIndex = run.selectedIdeaIndex ?? 0;
  const chosen = ideas[ideaIndex];
  if (!chosen) throw new Error("invalid-idea-index");

  await setRun(runId, { status: "running" });

  const existingSteps = await db.select().from(missionSteps).where(eq(missionSteps.runId, runId));
  const stepByKind = new Map(existingSteps.map((s) => [s.kind, s]));
  const usedOrds = new Set(existingSteps.map((s) => s.ord));
  let ord = 10;
  while (usedOrds.has(ord)) ord++;
  try {
    const brandVoice = await resolveMissionBrandVoice(mission);

    // 2. Hooks (skip if already done — idempotent on restart)
    let bestHook: { text: string; score?: number } | undefined;
    const hookStep = stepByKind.get("hooks");
    if (hookStep?.output && (hookStep.output as any).hookText) {
      bestHook = { text: (hookStep.output as any).hookText, score: (hookStep.output as any).score };
    } else {
      const hooks = await generateHooks(chosen.title, mission.platform, "professional network", brandVoice);
      bestHook = hooks.hooks[hooks.bestHookIndex] ?? hooks.hooks[0];
      await pushStep({
        runId, ord: ord++, kind: "hooks", toolCall: "generateHooks",
        input: { topic: chosen.title },
        output: {
          hookText: bestHook?.text,
          score: bestHook?.score,
          count: hooks.hooks.length,
          bestHookIndex: hooks.bestHookIndex,
          bestHookExplanation: hooks.bestHookExplanation,
          candidates: hooks.hooks.map((h) => ({
            text: h.text, style: h.style, score: h.score, reasoning: h.reasoning,
          })),
        },
      });
    }

    // 3. Draft full caption (idempotent — full text persisted to step output
    //    so a crash between pushStep and setRun still rehydrates correctly).
    let finalText: string; let finalHashtags: string[];
    const draftStep = stepByKind.get("draft");
    const draftOut = (draftStep?.output ?? null) as { finalText?: string; hashtags?: string[] } | null;
    if (draftOut?.finalText) {
      finalText = draftOut.finalText;
      finalHashtags = draftOut.hashtags ?? [];
    } else if (run.finalText) {
      // Older steps stored only textLength — trust the run-level cache.
      finalText = run.finalText;
      finalHashtags = run.finalHashtags ?? [];
    } else {
      const outlineText = Array.isArray(chosen.outline) ? chosen.outline.join("\n• ") : "";
      const draftSeed = `${bestHook?.text || ""}\n\n${outlineText || chosen.hook || ""}`.trim();
      const rewritten = await rewriteCaption(draftSeed, mission.platform, brandVoice);
      finalText = rewritten.rewrittenCaption || draftSeed;
      finalHashtags = rewritten.hashtags || [];
      await pushStep({
        runId, ord: ord++, kind: "draft", toolCall: "rewriteCaption",
        input: { seedLength: draftSeed.length },
        output: { textLength: finalText.length, hashtags: finalHashtags, finalText },
      });
    }

    // 3b. Self-critique + refine via OpenAI tool-calling. The model is given
    //     access to `rewrite_caption` and `tighten_hook` tools and decides
    //     whether the draft needs another pass. Both `critique` and (if the
    //     loop fires a tool) `refine` are recorded as their own mission_steps
    //     rows so the run inspector shows the full Brainstorm → Critique →
    //     Refine → Final timeline. Idempotent on restart.
    const critiqueStep = stepByKind.get("critique");
    const critiqueOut = (critiqueStep?.output ?? null) as { critique?: string; refinedText?: string } | null;
    if (critiqueOut?.refinedText) {
      finalText = critiqueOut.refinedText;
    } else if (!critiqueStep) {
      const refined = await critiqueAndRefine({
        runId, ord, draft: finalText, hook: bestHook?.text || "",
        platform: mission.platform, brandVoice, goal: mission.goal || mission.brief,
      });
      ord = refined.nextOrd;
      if (refined.refinedText && refined.refinedText !== finalText) {
        finalText = refined.refinedText;
        // Update the persisted draft step so a later restart sees the final
        // text in `draft.output.finalText` too — the source of truth stays
        // consistent for downstream rehydration.
        await db
          .update(missionSteps)
          .set({ output: { textLength: finalText.length, hashtags: finalHashtags, finalText, refined: true } })
          .where(and(eq(missionSteps.runId, runId), eq(missionSteps.kind, "draft")));
      }
    }

    // 4. Score (idempotent — viralScore persisted in step output so a crash
    //    before setRun won't cause us to re-charge credits or default to 0).
    let viralScore: number;
    const scoreStep = stepByKind.get("score");
    const scoreOut = (scoreStep?.output ?? null) as { viralScore?: number } | null;
    if (typeof scoreOut?.viralScore === "number") {
      viralScore = scoreOut.viralScore;
    } else if (typeof run.predictedScore === "number" && run.predictedScore > 0) {
      viralScore = run.predictedScore;
    } else {
      const score = await analyzeContent(chosen.title, finalText, mission.platform, "post");
      viralScore = score.viralScore;
      await pushStep({
        runId, ord: ord++, kind: "score", toolCall: "analyzeContent",
        input: { platform: mission.platform },
        output: {
          viralScore: score.viralScore,
          breakdown: {
            hook: score.hookScore, visual: score.visualScore, structure: score.structureScore,
            metadata: score.metadataScore, timing: score.timingScore,
          },
        },
      });
    }

    // 5. Pick slot from heatmap (idempotent — scheduledFor persisted in step
    //    output, so a crash before setRun still recovers the same slot).
    let scheduledFor: Date;
    const slotStep = stepByKind.get("pickSlot");
    const slotOut = (slotStep?.output ?? null) as { scheduledFor?: string } | null;
    if (slotOut?.scheduledFor) {
      scheduledFor = new Date(slotOut.scheduledFor);
    } else if (run.scheduledFor) {
      scheduledFor = run.scheduledFor;
    } else {
      const platform = normalizePlatform(mission.platform);
      const niche = normalizeNiche(mission.brief.split(/\s+/).find(Boolean));
      const heat = await computeHeatmap(run.userId, platform, niche, "UTC");
      const topSlot = heat.top[0];
      if (topSlot) {
        const now = new Date();
        const cur = now.getUTCDay();
        let delta = (topSlot.dow - cur + 7) % 7;
        if (delta === 0 && topSlot.hour <= now.getUTCHours()) delta = 7;
        const d = new Date(now);
        d.setUTCDate(d.getUTCDate() + delta);
        d.setUTCHours(topSlot.hour, 0, 0, 0);
        scheduledFor = d;
      } else {
        scheduledFor = new Date(Date.now() + 12 * HOUR_MS);
      }
      await pushStep({
        runId, ord: ord++, kind: "pickSlot", toolCall: "computeHeatmap",
        input: { platform, niche },
        output: { scheduledFor: scheduledFor.toISOString(), multiplier: topSlot?.multiplier ?? 1 },
      });
    }

    // 6. Await approval gate (always pause in v0)
    if (!stepByKind.has("awaitApproval")) {
      await pushStep({ runId, ord: ord++, kind: "awaitApproval", output: { mode: mission.approvalMode } });
      // Open a pending approval row the moment we pause at the gate so we
      // can compute "time-to-approve" later (decidedAt - createdAt).
      await db.insert(missionApprovals).values({
        userId: run.userId,
        missionId: mission.id,
        runId,
        gate: "draft",
      });
    }

    await setRun(runId, {
      status: "awaiting_approval",
      finalText,
      finalHashtags,
      predictedScore: viralScore,
      scheduledFor,
    });
    await audit({ userId: run.userId, missionId: mission.id, runId, event: "draft.ready", meta: { score: viralScore } });

    // Bill the user for the actual model work this draft used: the sum of
    // every step's `creditCost`. Mirrors the per-step accounting the UI
    // shows in the run inspector / mission cost rollup.
    try {
      const finalSteps = await db.select().from(missionSteps).where(eq(missionSteps.runId, runId));
      const totalCredits = finalSteps.reduce((a, s) => a + (s.creditCost || 0), 0);
      if (totalCredits > 0) await decrementUserCredits(run.userId, totalCredits);
    } catch (e: any) {
      log(`credit deduction failed for run=${runId}: ${e?.message || e}`);
    }

    const [updated] = await db.select().from(missionRuns).where(eq(missionRuns.id, runId));
    return updated;
  } catch (err: any) {
    log(`select idea failed for run=${runId}: ${err?.message || err}`);
    await pushStep({ runId, ord: ord++, kind: "draft", status: "failed", error: String(err?.message || err) });
    await setRun(runId, { status: "failed", error: String(err?.message || err) });
    await audit({ userId: run.userId, missionId: mission.id, runId, event: "draft.error", meta: { error: String(err?.message || err) } });
    throw err;
  }
}

/**
 * Convenience — full draft flow for the autopilot tick (non-interactive).
 * Equivalent to: proposeIdeas → auto-pick top idea → finalize draft.
 */
export async function generateDraftForRun(runId: string): Promise<MissionRun> {
  await proposeIdeasForRun(runId);
  await selectIdeaForRun(runId, 0);
  return executeDraftPipeline(runId);
}

/**
 * Reject + regenerate. Marks the current run as rejected and creates a
 * sibling run carrying the user's feedback so the next ideation pass can
 * incorporate it.
 */
export async function regenerateRun(runId: string, feedback: string): Promise<MissionRun> {
  const [run] = await db.select().from(missionRuns).where(eq(missionRuns.id, runId));
  if (!run) throw new Error("run-not-found");
  if (run.status === "posted" || run.status === "complete" || run.status === "posting") {
    throw new Error(`cannot-regenerate-from-${run.status}`);
  }
  await setRun(runId, { status: "rejected", rejectReason: feedback || "regenerate requested" });
  await audit({ userId: run.userId, missionId: run.missionId, runId, event: "run.regenerate", meta: { feedback } });
  // Resolve the pending mission_approvals row so approval metrics
  // (time-to-approve, approval rate) reflect the user's regenerate choice
  // instead of leaving a dangling open gate.
  await resolveApproval(runId, run.userId, run.missionId, "rejected", feedback || "regenerate requested", { regenerate: true });

  // Queue the sibling run as `pending`. The scheduler tick (kicked
  // immediately via the route handler) drains it through the same
  // idempotent draft pipeline — handlers do no model work themselves.
  const [next] = await db.insert(missionRuns).values({
    missionId: run.missionId,
    userId: run.userId,
    status: "pending",
    parentRunId: run.id,
    regenerationFeedback: feedback || null,
  }).returning();
  return next;
}

/**
 * Summarize the user's recent learning events into a "prediction accuracy"
 * snapshot: MAE per platform plus an LLM-written top-3 list of things the
 * agent has learned this week. Result is cached in-memory per user for 24h
 * so we don't re-issue the model call on every dashboard load.
 */
type AccuracySummary = {
  generatedAt: string;
  windowDays: number;
  sampleSize: number;
  perPlatform: { platform: string; samples: number; mae: number }[];
  topLearnings: string[];
};
const _summaryCache = new Map<string, { at: number; data: AccuracySummary }>();
const SUMMARY_TTL_MS = 24 * 60 * 60 * 1000;

const _summaryRefreshing = new Set<string>();

async function _refreshAccuracySummary(userId: string): Promise<void> {
  if (_summaryRefreshing.has(userId)) return;
  _summaryRefreshing.add(userId);
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const rows = await db
      .select()
      .from(learningEvents)
      .where(and(eq(learningEvents.userId, userId), gte(learningEvents.createdAt, since)))
      .orderBy(desc(learningEvents.createdAt))
      .limit(100);

    const byPlat = new Map<string, { sum: number; n: number }>();
    for (const r of rows) {
      if (r.errorMagnitude == null) continue;
      const cur = byPlat.get(r.platform) ?? { sum: 0, n: 0 };
      cur.sum += Math.abs(r.errorMagnitude);
      cur.n += 1;
      byPlat.set(r.platform, cur);
    }
    const perPlatform = Array.from(byPlat.entries()).map(([platform, v]) => ({
      platform, samples: v.n, mae: Math.round((v.sum / v.n) * 10) / 10,
    }));

    let topLearnings: string[] = [];
    if (rows.length >= 3) {
      try {
        const compact = rows.slice(0, 30).map((r) => ({
          platform: r.platform,
          predicted: r.predictedScore,
          actual: r.actualNormalizedScore,
          err: r.errorMagnitude,
          insight: r.insight,
        }));
        const resp = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You analyze prediction-vs-actual data for a content agent. Reply ONLY as JSON: { learnings: string[] } with the three most actionable patterns. Each learning is one sentence." },
            { role: "user", content: JSON.stringify(compact) },
          ],
          response_format: { type: "json_object" },
          temperature: 0.4,
        });
        const parsed = JSON.parse(resp.choices[0]?.message?.content || "{}");
        if (Array.isArray(parsed.learnings)) topLearnings = parsed.learnings.slice(0, 3).map(String);
      } catch (e: any) {
        log(`accuracy summary llm failed: ${e?.message || e}`);
      }
    }
    _summaryCache.set(userId, {
      at: Date.now(),
      data: {
        generatedAt: new Date().toISOString(),
        windowDays: 7,
        sampleSize: rows.length,
        perPlatform,
        topLearnings,
      },
    });
  } finally {
    _summaryRefreshing.delete(userId);
  }
}

export async function getAccuracySummary(userId: string): Promise<AccuracySummary> {
  // Always serve from cache; refresh in the background if stale. Keeps the
  // request path off the LLM (which could otherwise add several seconds to
  // the dashboard load).
  const cached = _summaryCache.get(userId);
  const stale = !cached || Date.now() - cached.at >= SUMMARY_TTL_MS;
  if (stale) {
    if (!cached) {
      // Cold cache — do one in-line refresh so the user sees real numbers
      // on first load. Subsequent loads always come from cache.
      await _refreshAccuracySummary(userId);
    } else {
      setImmediate(() => _refreshAccuracySummary(userId).catch(() => {}));
    }
  }
  const fresh = _summaryCache.get(userId);
  if (fresh) return fresh.data;
  // No data at all yet (e.g. first-time user) — return an empty summary.
  return {
    generatedAt: new Date().toISOString(),
    windowDays: 7,
    sampleSize: 0,
    perPlatform: [],
    topLearnings: [],
  };
}

/**
 * Phase 2 — User approves the draft. We persist any edits, mark approved,
 * and let the scheduler publish at the chosen slot.
 */
export async function approveRun(runId: string, edits?: { finalText?: string; finalHashtags?: string[]; scheduledFor?: Date }): Promise<MissionRun> {
  const [run] = await db.select().from(missionRuns).where(eq(missionRuns.id, runId));
  if (!run) throw new Error("run-not-found");
  if (run.status !== "awaiting_approval") throw new Error(`cannot-approve-from-${run.status}`);

  await setRun(runId, {
    status: "approved",
    finalText: edits?.finalText ?? run.finalText,
    finalHashtags: edits?.finalHashtags ?? run.finalHashtags,
    scheduledFor: edits?.scheduledFor ?? run.scheduledFor,
  });
  await pushStep({
    runId, ord: 100, kind: "approve",
    output: { editedText: !!edits?.finalText, scheduledFor: (edits?.scheduledFor ?? run.scheduledFor)?.toISOString() },
  });
  await audit({ userId: run.userId, missionId: run.missionId, runId, event: "run.approved" });
  // Resolve the pending mission_approvals row opened when we paused at the
  // gate so decidedAt − createdAt = real time-to-approve. If for any reason
  // there isn't a pending row (older runs, replay), insert a synthetic one.
  await resolveApproval(runId, run.userId, run.missionId, "approved", null, {
    editedText: !!edits?.finalText,
    scheduledFor: (edits?.scheduledFor ?? run.scheduledFor)?.toISOString() ?? null,
  });
  const [updated] = await db.select().from(missionRuns).where(eq(missionRuns.id, runId));
  return updated;
}

export async function rejectRun(runId: string, reason: string): Promise<void> {
  const [run] = await db.select().from(missionRuns).where(eq(missionRuns.id, runId));
  if (!run) throw new Error("run-not-found");
  await setRun(runId, { status: "rejected", rejectReason: reason || "rejected by user" });
  await pushStep({ runId, ord: 100, kind: "reject", output: { reason } });
  await audit({ userId: run.userId, missionId: run.missionId, runId, event: "run.rejected", meta: { reason } });
  await resolveApproval(runId, run.userId, run.missionId, "rejected", reason || null, null);
}

async function resolveApproval(
  runId: string,
  userId: string,
  missionId: string,
  decision: "approved" | "rejected",
  feedback: string | null,
  meta: Record<string, unknown> | null,
): Promise<void> {
  const [pending] = await db
    .select()
    .from(missionApprovals)
    .where(and(eq(missionApprovals.runId, runId), isNull(missionApprovals.decidedAt)))
    .orderBy(desc(missionApprovals.createdAt))
    .limit(1);
  if (pending) {
    await db
      .update(missionApprovals)
      .set({ decision, decidedBy: userId, decidedAt: new Date(), feedback, meta: meta as any })
      .where(eq(missionApprovals.id, pending.id));
  } else {
    await db.insert(missionApprovals).values({
      userId, missionId, runId, gate: "draft",
      decision, decidedBy: userId, decidedAt: new Date(), feedback, meta: meta as any,
    });
  }
}

/**
 * Phase 3 — Publish an approved run whose slot has arrived.
 * Called from the scheduler tick. Idempotent.
 */
export async function publishRun(runId: string): Promise<void> {
  const [run] = await db.select().from(missionRuns).where(eq(missionRuns.id, runId));
  if (!run) return;
  // Run-level pause/cancel sets status away from "approved", so this single
  // guard handles both the kill switch (which holds runs at "approved" until
  // released) and granular pause/cancel (which moves status to paused/cancelled).
  // We also accept "posting" so a server restart between the LinkedIn call
  // and the final setRun can be reconciled idempotently below.
  if (run.status !== "approved" && run.status !== "posting") return;
  if (!run.scheduledFor || run.scheduledFor.getTime() > Date.now()) return;

  // Reconcile a half-finished post. We always write a `post.intent` step
  // BEFORE calling LinkedIn, and update the same step with the returned urn
  // AFTER. So on restart we have three possible states:
  //   • intent + urn   → call succeeded; promote to "posted" (no re-post).
  //   • intent, no urn → call may or may not have reached LinkedIn. Fail-safe:
  //                      mark the run failed so a human can verify. We refuse
  //                      to re-post because LinkedIn UGC has no idempotency
  //                      key and double-posting is the worse failure mode.
  //   • neither        → fresh run, proceed normally below.
  const [intentStep] = await db
    .select()
    .from(missionSteps)
    .where(and(eq(missionSteps.runId, runId), eq(missionSteps.kind, "post.intent")))
    .limit(1);
  if (intentStep) {
    const intentOut = (intentStep.output ?? {}) as { urn?: string; url?: string };
    const [m] = await db.select().from(missions).where(eq(missions.id, run.missionId));
    // Helper to commit a recovery (used by both the local-urn and the
    // LinkedIn-verified-urn paths below).
    const promoteToPosted = async (urn: string, url: string | null, source: "intent" | "linkedin") => {
      if (!m) return;
      await setRun(runId, {
        status: "posted",
        postedAt: run.postedAt ?? new Date(),
        externalPostUrn: urn,
        externalPostUrl: url,
        measureAt: run.measureAt ?? new Date(Date.now() + MEASURE_DELAY_MS),
      });
      await db.insert(missionArtifacts).values({
        userId: run.userId, missionId: m.id, runId,
        kind: "post", platform: m.platform,
        text: (run.finalText || "").trim(),
        hashtags: run.finalHashtags || [],
        externalId: urn,
        externalUrl: url,
      }).onConflictDoNothing();
      await audit({ userId: run.userId, missionId: m.id, runId, event: "post.recovered", meta: { source } });
    };

    if (intentOut.urn) {
      log(`publishRun reconciling stuck run=${runId} from existing post.intent (urn present)`);
      await promoteToPosted(intentOut.urn, intentOut.url ?? null, "intent");
    } else {
      // Intent exists but no urn — the LinkedIn call may or may not have
      // succeeded. Before failing the run (and stranding the user) we
      // ASK LinkedIn whether our post actually landed by listing the
      // member's recent posts and matching commentary text. Only if
      // LinkedIn has no matching post do we fail-closed (refuse to retry
      // to avoid a duplicate).
      const tags = (run.finalHashtags || []).map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
      const bodyText = (run.finalText || "").trim();
      const fullText = tags ? `${bodyText}\n\n${tags}` : bodyText;
      const conn = await getConnectionForUser(run.userId);
      let verified: { urn: string; url: string } | null = null;
      if (conn && fullText) {
        try {
          verified = await findRecentPostByText(conn, fullText);
        } catch (e: any) {
          log(`publishRun verify lookup failed for run=${runId}: ${e?.message || e}`);
        }
      }
      if (verified?.urn) {
        log(`publishRun recovered run=${runId} via LinkedIn lookup (urn=${verified.urn})`);
        // Stamp the verified urn back onto the intent step so future
        // reconciliations short-circuit on the local copy.
        const priorIntent =
          (intentStep.output && typeof intentStep.output === "object" && !Array.isArray(intentStep.output)
            ? (intentStep.output as Record<string, unknown>)
            : {});
        await db
          .update(missionSteps)
          .set({ output: { ...priorIntent, urn: verified.urn, url: verified.url, confirmedVia: "linkedin-lookup", confirmedAt: new Date().toISOString() } })
          .where(eq(missionSteps.id, intentStep.id));
        await promoteToPosted(verified.urn, verified.url, "linkedin");
      } else {
        log(`publishRun marking run=${runId} failed — post.intent exists, no urn, and LinkedIn has no matching recent post`);
        await setRun(runId, {
          status: "failed",
          error: "post-intent-without-confirmation: LinkedIn has no matching recent post; refusing to retry to avoid double-post",
        });
        await audit({ userId: run.userId, missionId: run.missionId, runId, event: "post.intent.unconfirmed", meta: { verifiedAgainstLinkedIn: !!conn } });
      }
    }
    return;
  }

  // Honour the user kill switch even on the immediate-publish path
  const [u] = await db.select({ paused: users.autopilotPaused }).from(users).where(eq(users.id, run.userId));
  if (u?.paused) {
    log(`publish skipped — user ${run.userId} is paused`);
    await audit({ userId: run.userId, missionId: run.missionId, runId, event: "post.skip.paused" });
    return;
  }

  const [mission] = await db.select().from(missions).where(eq(missions.id, run.missionId));
  if (!mission) return;

  // Daily cap
  if (await dailyCapReached(run.userId, mission.platform)) {
    log(`daily cap reached for user=${run.userId} platform=${mission.platform}; skipping`);
    await audit({ userId: run.userId, missionId: mission.id, runId, event: "post.skip.cap" });
    return;
  }

  // If LinkedIn isn't configured (server-side) or the user has disconnected,
  // park the run at "approved" instead of marking it failed. The next tick
  // after they reconnect will publish it. This matches the "disconnect
  // pauses scheduled outputs" expectation and avoids losing approved drafts.
  const platform = mission.platform as PlatformId;
  if (!isPlatformConfigured(platform)) {
    log(`publish skipped — ${platform} not configured`);
    await audit({ userId: run.userId, missionId: mission.id, runId, event: "post.skip.unconfigured", meta: { platform } });
    return;
  }
  const conn = await getConnectionForPlatform(run.userId, platform);
  if (!conn) {
    log(`publish skipped — user ${run.userId} has no ${platform} connection`);
    await audit({ userId: run.userId, missionId: mission.id, runId, event: "post.skip.disconnected", meta: { platform } });
    return;
  }

  await setRun(runId, { status: "posting" });
  try {
    const text = (run.finalText || "").trim();
    const tags = (run.finalHashtags || []).map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
    const fullText = tags ? `${text}\n\n${tags}` : text;

    // CRITICAL: persist the *intent* to post BEFORE calling LinkedIn so a
    // crash mid-call leaves a trail. The reconciler at the top of this fn
    // refuses to retry an unconfirmed intent (no urn) — fail-closed against
    // double-posts. After a successful API call we update the same step in
    // place so a restart between the API response and the final setRun still
    // recovers via the urn.
    const idempotencyKey = `${runId}:${Date.now()}`;
    const intent = await pushStep({
      runId, ord: 195, kind: "post.intent", toolCall: `${platform}.publish`,
      input: { textLength: fullText.length, idempotencyKey, platform },
      output: { idempotencyKey, attemptedAt: new Date().toISOString() },
    });

    // Instagram requires media on every publish — generate and stage an
    // image right before posting so the URL is fresh when IG fetches it.
    let mediaUrl: string | undefined;
    if (platform === "instagram") {
      const { generateInstagramMediaUrl } = await import("./integrations/instagram-media");
      const mediaStep = await pushStep({
        runId, ord: 190, kind: "media", toolCall: "instagram.generateMedia",
        input: { captionLength: fullText.length },
      });
      mediaUrl = await generateInstagramMediaUrl(fullText);
      if (mediaStep) {
        await db.update(missionSteps).set({ output: { mediaUrlIssued: true, expiresInHours: 6 } }).where(eq(missionSteps.id, mediaStep.id));
      }
    }
    const { urn, url } = await postToPlatform(platform, conn, fullText, { mediaUrl });

    // Stamp the urn onto the intent step first (this is the durable
    // confirmation the reconciler reads). Then write the canonical "post"
    // step + update the run row.
    await db
      .update(missionSteps)
      .set({ output: { idempotencyKey, attemptedAt: (intent.output as any)?.attemptedAt, urn, url, confirmedAt: new Date().toISOString() } })
      .where(eq(missionSteps.id, intent.id));
    await pushStep({
      runId, ord: 200, kind: "post", toolCall: `${platform}.publish`,
      output: { urn, url, platform },
    });
    await setRun(runId, {
      status: "posted",
      postedAt: new Date(),
      externalPostUrn: urn,
      externalPostUrl: url,
      measureAt: new Date(Date.now() + MEASURE_DELAY_MS),
    });
    // Persist the final published artifact for downstream tooling
    // (export, share-link, audit). One per run, idempotent on (runId, kind).
    await db.insert(missionArtifacts).values({
      userId: run.userId,
      missionId: mission.id,
      runId,
      kind: "post",
      platform: mission.platform,
      text,
      hashtags: run.finalHashtags || [],
      externalId: urn,
      externalUrl: url,
    }).onConflictDoNothing();

    // Mirror into contentAnalyses for the existing dashboard/analytics surfaces.
    // Persist the linkage so measureRun can write back actual metrics.
    try {
      const [ca] = await db.insert(contentAnalyses).values({
        userId: run.userId,
        contentType: "post",
        title: text.slice(0, 80),
        description: fullText,
        targetPlatform: mission.platform,
        viralScore: run.predictedScore,
        status: "posted",
        postedAt: new Date(),
      }).returning();
      if (ca?.id) {
        await setRun(runId, { contentAnalysisId: ca.id });
      }
    } catch (e: any) {
      log(`mirror to contentAnalyses failed for run=${runId}: ${e?.message || e}`);
    }

    await audit({ userId: run.userId, missionId: mission.id, runId, event: "post.success", meta: { urn } });
    await db
      .update(missions)
      .set({ lastRunAt: new Date(), updatedAt: new Date() })
      .where(eq(missions.id, mission.id));
  } catch (err: any) {
    log(`publish failed for run=${runId}: ${err?.message || err}`);
    await pushStep({
      runId, ord: 200, kind: "post", status: "failed", error: String(err?.message || err),
    });
    await setRun(runId, { status: "failed", error: String(err?.message || err) });
    await audit({ userId: run.userId, missionId: run.missionId, runId, event: "post.error", meta: { error: String(err?.message || err) } });
  }
}

/**
 * Phase 4 — Ingest analytics 24h after posting and write a learning event.
 */
export async function measureRun(runId: string): Promise<void> {
  const [run] = await db.select().from(missionRuns).where(eq(missionRuns.id, runId));
  if (!run) return;
  if (run.status !== "posted") return;
  if (!run.measureAt || run.measureAt.getTime() > Date.now()) return;
  if (!run.externalPostUrn) return;

  await setRun(runId, { status: "measuring" });
  try {
    const [missionRow] = await db.select().from(missions).where(eq(missions.id, run.missionId));
    const platform = (missionRow?.platform as PlatformId) || "linkedin";
    const conn = await getConnectionForPlatform(run.userId, platform);
    if (!conn) throw new Error("no-connection");

    const stats = await fetchPostStatsForPlatform(platform, conn, run.externalPostUrn);
    const engagement = (stats.likes ?? 0) + (stats.comments ?? 0) * 5;
    // Prefer the real impression count from LinkedIn analytics. Only when
    // the scope isn't granted do we fall back to a documented estimate so
    // downstream UI keeps working — and we record `impressionsSource` so
    // the learning loop knows it was inferred, not measured.
    const impressionsReal = stats.impressions;
    const clicksReal = stats.clicks;
    const impressions = impressionsReal ?? Math.max(0, engagement * 30);
    const impressionsSource: "linkedin" | "estimate" = impressionsReal != null ? "linkedin" : "estimate"; // legacy enum, retained for back-compat

    await setRun(runId, {
      status: "complete",
      actualImpressions: impressions,
      actualLikes: stats.likes ?? 0,
      actualComments: stats.comments ?? 0,
    });
    const measureStep = await pushStep({
      runId, ord: 300, kind: "measure", toolCall: `${platform}.stats`,
      output: { ...stats, platform },
    });

    // Write actuals back into the linked contentAnalyses row so the existing
    // dashboard / analytics surfaces show real performance instead of just
    // the prediction.
    if (run.contentAnalysisId) {
      try {
        await db.update(contentAnalyses)
          .set({
            actualViews: impressions,
            actualLikes: stats.likes ?? 0,
            actualComments: stats.comments ?? 0,
            actualShares: clicksReal ?? 0,
            updatedAt: new Date(),
          })
          .where(eq(contentAnalyses.id, run.contentAnalysisId));
      } catch (e: any) {
        log(`actuals writeback failed for run=${runId}: ${e?.message || e}`);
      }
    }

    const predicted = run.predictedScore ?? 50;
    const actualNorm = Math.min(100, Math.round((impressions / 5000) * 100));
    const errorMag = Math.abs(predicted - actualNorm);
    const overperformed = actualNorm > predicted;
    const insight = errorMag <= 10
      ? "Prediction matched within 10pts."
      : overperformed
        ? "Outperformed prediction — similar hooks deserve more weight."
        : "Underperformed prediction — try a stronger hook style.";
    const signals = {
      hookText: (run.finalText || "").split("\n", 1)[0]?.slice(0, 140) ?? null,
      hashtags: run.finalHashtags ?? [],
      ideaIndex: run.selectedIdeaIndex ?? null,
      regenerated: !!run.parentRunId,
      cadenceHourUTC: run.scheduledFor ? new Date(run.scheduledFor).getUTCHours() : null,
      likes: stats.likes ?? 0,
      comments: stats.comments ?? 0,
      impressions,
      impressionsSource,
      clicks: clicksReal,
    };
    const reasoning = `Predicted ${predicted}, normalized actual ${actualNorm} (impressions=${impressions}, engagement=${engagement}). Δ=${errorMag}. ${insight}`;
    await db.insert(learningEvents).values({
      userId: run.userId,
      runId,
      missionStepId: measureStep?.id ?? null,
      platform,
      predictedScore: predicted,
      actualImpressions: impressions,
      actualEngagement: engagement,
      actualNormalizedScore: actualNorm,
      errorMagnitude: errorMag,
      signals,
      reasoning,
      insight,
    });
    await audit({ userId: run.userId, missionId: run.missionId, runId, event: "measure.success" });
  } catch (err: any) {
    log(`measure failed for run=${runId}: ${err?.message || err}`);
    await pushStep({
      runId, ord: 300, kind: "measure", status: "failed", error: String(err?.message || err),
    });
    await setRun(runId, { status: "complete", error: String(err?.message || err) });
  }
}

/**
 * Scheduler tick — called every hour. Walks active missions and:
 *  - kicks off a new run when nextRunAt is due,
 *  - publishes any approved runs whose slot has arrived,
 *  - measures any posted runs whose 24h window has elapsed.
 *
 * Honors the global kill switch (users.autopilotPaused) and per-mission status.
 */
let tickInFlight = false;

export async function autopilotTick(): Promise<{ drafted: number; published: number; measured: number }> {
  if (tickInFlight) {
    log("tick skipped — previous tick still running");
    return { drafted: 0, published: 0, measured: 0 };
  }
  tickInFlight = true;
  try {
    return await _autopilotTickInner();
  } finally {
    tickInFlight = false;
  }
}

// Stuck-run thresholds. Drafts get more leash than posts because the
// LLM round trips can legitimately take a couple of minutes; a post that
// hasn't returned a urn within 5 min is almost certainly orphaned by a
// crash mid-call.
const DRAFT_STUCK_MS = 10 * 60 * 1000;
const POSTING_STUCK_MS = 5 * 60 * 1000;
// Number of sweep retries before we give up on a stuck draft and surface
// it to the user as failed. Each retry happens one DRAFT_STUCK_MS window
// apart, so the user-visible "give up" time ≈ MAX_DRAFT_SWEEP_RETRIES * 10min.
const MAX_DRAFT_SWEEP_RETRIES = 2;

async function notifyRunFailed(args: {
  userId: string;
  missionId: string;
  runId: string;
  reason: string;
  stage: "draft" | "post";
}): Promise<void> {
  try {
    await createNotification({
      userId: args.userId,
      type: "autopilot_failed",
      title: args.stage === "draft"
        ? "Autopilot draft needs your attention"
        : "Autopilot post needs your attention",
      body: args.reason,
      href: `/autopilot/runs/${args.runId}`,
      meta: { missionId: args.missionId, runId: args.runId, stage: args.stage },
    });
  } catch (e: any) {
    log(`notify run=${args.runId} failed: ${e?.message || e}`);
  }
}

/**
 * Reaper for runs that crashed mid-flight. Two failure modes:
 *
 *   • `running` > DRAFT_STUCK_MS — the draft pipeline died (LLM hang, OOM,
 *     server restart). Re-drive the pipeline phase-aware up to
 *     MAX_DRAFT_SWEEP_RETRIES times; after that mark the run failed and
 *     notify the user so it doesn't sit in "running" forever.
 *
 *   • `posting` > POSTING_STUCK_MS — the LinkedIn call may or may not have
 *     reached the API. Hand the run back to publishRun, which uses the
 *     persisted `post.intent` step to decide between promote-to-posted (urn
 *     present) and fail-closed (urn missing — refuse to retry to avoid
 *     double-posting). Either outcome is reconciled, never stranded.
 */
async function sweepStuckRuns(now: Date, pausedIds: Set<string>): Promise<void> {
  // 1. Stuck drafts
  const draftCutoff = new Date(now.getTime() - DRAFT_STUCK_MS);
  const stuckDrafts = await db
    .select()
    .from(missionRuns)
    .where(and(eq(missionRuns.status, "running"), lte(missionRuns.updatedAt, draftCutoff)))
    .limit(20);
  for (const r of stuckDrafts) {
    if (pausedIds.has(r.userId)) continue;
    const [m] = await db.select().from(missions).where(eq(missions.id, r.missionId));
    if (!m || m.status !== "active") continue;
    const prior = await db
      .select({ id: missionAudit.id })
      .from(missionAudit)
      .where(and(eq(missionAudit.runId, r.id), eq(missionAudit.event, "sweep.draft.retry")));
    if (prior.length >= MAX_DRAFT_SWEEP_RETRIES) {
      const reason = r.error || `Stuck in 'running' for >${Math.round(DRAFT_STUCK_MS / 60000)} min after ${prior.length} retries.`;
      await setRun(r.id, { status: "failed", error: reason });
      await audit({
        userId: r.userId, missionId: r.missionId, runId: r.id,
        event: "sweep.draft.failed", meta: { retries: prior.length, reason },
      });
      await notifyRunFailed({
        userId: r.userId, missionId: r.missionId, runId: r.id, stage: "draft",
        reason: "We tried to recover this draft a few times but it never finished. Open the run inspector to retry or regenerate.",
      });
      continue;
    }
    await audit({
      userId: r.userId, missionId: r.missionId, runId: r.id,
      event: "sweep.draft.retry", meta: { attempt: prior.length + 1 },
    });
    try {
      // Phase-aware re-drive: avoid jumping straight to executeDraftPipeline
      // (which throws `invalid-idea-index` if the ideate phase never finished).
      if (!r.proposedIdeas || !r.proposedIdeas.length) {
        await proposeIdeasForRun(r.id);
      } else if (r.selectedIdeaIndex == null) {
        await setRun(r.id, { status: "awaiting_idea" });
      } else {
        await executeDraftPipeline(r.id);
      }
    } catch (e: any) {
      log(`sweep retry run=${r.id} failed: ${e?.message || e}`);
    }
  }

  // 2. Stuck posts. publishRun is the single source of truth for
  // post-state reconciliation (post.intent → urn? promote : fail).
  const postCutoff = new Date(now.getTime() - POSTING_STUCK_MS);
  const stuckPosting = await db
    .select()
    .from(missionRuns)
    .where(and(eq(missionRuns.status, "posting"), lte(missionRuns.updatedAt, postCutoff)))
    .limit(20);
  for (const r of stuckPosting) {
    if (pausedIds.has(r.userId)) continue;
    await audit({
      userId: r.userId, missionId: r.missionId, runId: r.id,
      event: "sweep.posting.reconcile",
    });
    try {
      await publishRun(r.id);
    } catch (e: any) {
      log(`sweep reconcile run=${r.id} failed: ${e?.message || e}`);
    }
    // If publishRun marked the run failed (post.intent without urn — we
    // refuse to retry to avoid double-posting), notify the user so they
    // can verify on LinkedIn and decide what to do.
    const [after] = await db.select().from(missionRuns).where(eq(missionRuns.id, r.id));
    if (after?.status === "failed") {
      await notifyRunFailed({
        userId: r.userId, missionId: r.missionId, runId: r.id, stage: "post",
        reason: "A LinkedIn publish couldn't be confirmed. Check your LinkedIn feed before retrying — we won't re-post automatically.",
      });
    }
  }
}

async function _autopilotTickInner(): Promise<{ drafted: number; published: number; measured: number }> {
  const now = new Date();
  let drafted = 0, published = 0, measured = 0;

  // Honour the global per-user kill switch — paused users get nothing automated.
  const pausedUsers = await db.select({ id: users.id }).from(users).where(eq(users.autopilotPaused, true));
  const pausedIds = new Set(pausedUsers.map((u) => u.id));

  // Reap stuck drafts/posts BEFORE draining new work so the sweeper can
  // escalate to "failed" + notify the user instead of silently stranding
  // a run forever after a server crash.
  await sweepStuckRuns(now, pausedIds);

  // Drain pending runs (status=pending OR pending_draft). proposeIdeasForRun
  // and executeDraftPipeline are both idempotent — they consult mission_steps
  // before re-issuing model calls — so a tick that runs after a server
  // restart resumes the run instead of stalling or duplicating work.
  const pending = await db
    .select()
    .from(missionRuns)
    .where(
      or(
        eq(missionRuns.status, "pending"),
        eq(missionRuns.status, "pending_draft"),
      ),
    )
    .limit(20);
  for (const r of pending) {
    if (pausedIds.has(r.userId)) continue;
    const [m] = await db.select().from(missions).where(eq(missions.id, r.missionId));
    if (!m || m.status !== "active") continue;
    try {
      if (r.status === "pending") {
        const auto = r.regenerationFeedback === "__AUTO__";
        if (auto) {
          await db.update(missionRuns).set({ regenerationFeedback: null }).where(eq(missionRuns.id, r.id));
          await generateDraftForRun(r.id);
        } else {
          await proposeIdeasForRun(r.id);
        }
      } else if (r.status === "pending_draft") {
        await executeDraftPipeline(r.id);
      }
    } catch (e: any) {
      log(`drain run=${r.id} (${r.status}) failed: ${e?.message || e}`);
    }
  }

  // Publish ready runs. Also pick up any rows stuck in `posting` (server
  // restarted between the LinkedIn call and the final setRun) so publishRun
  // can reconcile them from the persisted `post` step instead of double-posting.
  const readyToPost = await db
    .select()
    .from(missionRuns)
    .where(
      and(
        or(
          eq(missionRuns.status, "approved"),
          eq(missionRuns.status, "posting"),
        ),
        lte(missionRuns.scheduledFor, now),
      ),
    )
    .limit(20);
  for (const r of readyToPost) {
    if (pausedIds.has(r.userId)) continue;
    const [u] = await db.select().from(missions).where(eq(missions.id, r.missionId));
    if (!u || u.status !== "active") continue;
    await publishRun(r.id);
    published++;
  }

  // Measure posted runs
  const toMeasure = await db
    .select()
    .from(missionRuns)
    .where(
      and(
        eq(missionRuns.status, "posted"),
        lte(missionRuns.measureAt, now),
      ),
    )
    .limit(20);
  for (const r of toMeasure) {
    // Honour the kill switch end-to-end: a paused user gets no drafting,
    // no posting, AND no measuring (no external LinkedIn calls).
    if (pausedIds.has(r.userId)) continue;
    await measureRun(r.id);
    measured++;
  }

  // Auto-draft for active missions whose nextRunAt is due
  const dueMissions = await db
    .select()
    .from(missions)
    .where(eq(missions.status, "active"))
    .limit(50);
  for (const m of dueMissions) {
    if (pausedIds.has(m.userId)) continue;
    if (m.nextRunAt && m.nextRunAt.getTime() > now.getTime()) continue;
    if (!m.nextRunAt) {
      // First time: schedule first run shortly after creation
      await db
        .update(missions)
        .set({ nextRunAt: new Date(now.getTime() + 5 * 60 * 1000) })
        .where(eq(missions.id, m.id));
      continue;
    }
    // Skip if there's already a run in flight
    const inflight = await db
      .select({ id: missionRuns.id })
      .from(missionRuns)
      .where(
        and(
          eq(missionRuns.missionId, m.id),
          // any non-terminal status
        ),
      )
      .orderBy(desc(missionRuns.createdAt))
      .limit(1);
    if (inflight[0]) {
      const [last] = await db.select().from(missionRuns).where(eq(missionRuns.id, inflight[0].id));
      if (last && !["complete", "failed", "rejected", "posted", "cancelled"].includes(last.status)) {
        continue;
      }
    }
    // Queue a new pending run; it will be drained by the pending pass below
    // on the same tick.
    await db
      .insert(missionRuns)
      .values({ missionId: m.id, userId: m.userId, status: "pending" });
    drafted++;
    // Schedule next run based on cadence
    const intervalDays =
      m.cadence === "daily" ? 1 :
      m.cadence === "weekly" ? 7 :
      m.cadence === "weekdays" ? Math.max(1, Math.round(5 / Math.max(1, m.postsPerWeek))) :
      999;
    let next = new Date(now.getTime() + intervalDays * DAY_MS);
    // For "weekdays", roll forward off Sat/Sun so the agent never schedules
    // a run on the weekend.
    if (m.cadence === "weekdays") {
      while (next.getUTCDay() === 0 || next.getUTCDay() === 6) {
        next = new Date(next.getTime() + DAY_MS);
      }
    }
    await db
      .update(missions)
      .set({ nextRunAt: next })
      .where(eq(missions.id, m.id));
  }

  if (drafted || published || measured) {
    log(`tick: drafted=${drafted} published=${published} measured=${measured}`);
  }
  return { drafted, published, measured };
}
