import OpenAI from "openai";
import { db } from "./db";
import { contentAnalyses, analysisHistory, users } from "@shared/schema";
import { eq, desc, count } from "drizzle-orm";
import {
  resolveScoringProfile,
  predictRetentionCurve,
  normalizeFixes,
  estimateConfidence,
  buildScoreDiff,
  runAnalysisPipeline,
  PIPELINE_STAGES,
  type AnalysisResultV2,
  type FixSuggestion,
  type ScoreDiff,
  type StageListener,
} from "@repo/score-engine";

const openai = new OpenAI({
  apiKey:
    process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

/** @deprecated Prefer AnalysisResultV2 — kept for agent/autopilot callers */
export type AnalysisResult = AnalysisResultV2;

function buildPrompt(opts: {
  title: string;
  description: string;
  platform: string;
  contentType: string;
  profileFocus: string;
  profileVersion: string;
  hookWindowSeconds: number;
}): string {
  return `You are an expert content analyst for social media. Analyze the following content and provide a detailed viral score breakdown.

Scoring profile: ${opts.profileVersion}
Platform focus: ${opts.profileFocus}
Critical hook window: first ${opts.hookWindowSeconds} second(s).

Content Details:
- Title: ${opts.title}
- Description: ${opts.description}
- Platform: ${opts.platform}
- Content Type: ${opts.contentType}

Analyze this content and provide scores out of 20 for each category. Be specific and actionable in your suggestions.

Respond in this exact JSON format:
{
  "viralScore": <total score out of 100>,
  "hookScore": <score out of 20 - how attention-grabbing is the opening within the hook window>,
  "hookAnalysis": "<detailed analysis of the hook/opening>",
  "hookSuggestions": ["<specific suggestion 1>", "<specific suggestion 2>", "<specific suggestion 3>"],
  "visualScore": <score out of 20 - visual appeal and thumbnail potential>,
  "visualAnalysis": "<detailed analysis of visual elements>",
  "visualSuggestions": ["<specific suggestion 1>", "<specific suggestion 2>", "<specific suggestion 3>"],
  "structureScore": <score out of 20 - content pacing and structure>,
  "structureAnalysis": "<detailed analysis of content structure>",
  "structureSuggestions": ["<specific suggestion 1>", "<specific suggestion 2>", "<specific suggestion 3>"],
  "metadataScore": <score out of 20 - title, description, hashtags optimization>,
  "metadataAnalysis": "<detailed analysis of metadata>",
  "metadataSuggestions": ["<specific suggestion 1>", "<specific suggestion 2>", "<specific suggestion 3>"],
  "timingScore": <score out of 20 - posting time optimization>,
  "timingAnalysis": "<analysis of timing considerations>",
  "optimalPostingTime": "<recommended day and time to post, e.g., 'Tuesday 6PM EST'>",
  "top3Fixes": [
    {"component": "hook|visual|structure|metadata|timing", "issue": "<main issue>", "fix": "<specific actionable fix to try>", "predictedImpact": <points this could add>},
    {"component": "hook|visual|structure|metadata|timing", "issue": "<second issue>", "fix": "<specific actionable fix>", "predictedImpact": <points>},
    {"component": "hook|visual|structure|metadata|timing", "issue": "<third issue>", "fix": "<specific actionable fix>", "predictedImpact": <points>}
  ],
  "predictedScoreAfterFixes": <projected score if all fixes are applied>
}

Be honest but constructive. Scores should reflect real-world viral potential. Most content scores between 40-70.
Always include "component" on each top3Fixes item.`;
}

function clampResult(
  raw: Partial<AnalysisResultV2> & { top3Fixes?: FixSuggestion[] },
  profileVersion: string,
  confidence: number,
  title: string,
  description: string,
  platform: string,
): AnalysisResultV2 {
  const top3Fixes = normalizeFixes(raw.top3Fixes ?? []);
  const hookScore = Math.min(20, Math.max(0, Number(raw.hookScore) || 0));
  const visualScore = Math.min(20, Math.max(0, Number(raw.visualScore) || 0));
  const structureScore = Math.min(20, Math.max(0, Number(raw.structureScore) || 0));
  const metadataScore = Math.min(20, Math.max(0, Number(raw.metadataScore) || 0));
  const timingScore = Math.min(20, Math.max(0, Number(raw.timingScore) || 0));
  const viralScore = Math.min(100, Math.max(0, Number(raw.viralScore) || 0));

  const retentionCurve = predictRetentionCurve({
    platform,
    title,
    description,
    hookScore,
    visualScore,
    structureScore,
  });

  return {
    viralScore,
    hookScore,
    hookAnalysis: raw.hookAnalysis || "",
    hookSuggestions: raw.hookSuggestions || [],
    visualScore,
    visualAnalysis: raw.visualAnalysis || "",
    visualSuggestions: raw.visualSuggestions || [],
    structureScore,
    structureAnalysis: raw.structureAnalysis || "",
    structureSuggestions: raw.structureSuggestions || [],
    metadataScore,
    metadataAnalysis: raw.metadataAnalysis || "",
    metadataSuggestions: raw.metadataSuggestions || [],
    timingScore,
    timingAnalysis: raw.timingAnalysis || "",
    optimalPostingTime: raw.optimalPostingTime || "Tuesday 6PM",
    top3Fixes,
    predictedScoreAfterFixes: Math.min(
      100,
      Math.max(viralScore, Number(raw.predictedScoreAfterFixes) || viralScore),
    ),
    confidence,
    scoringProfileVersion: profileVersion,
    retentionCurve,
  };
}

export async function analyzeContent(
  title: string,
  description: string,
  platform: string,
  contentType: string,
  opts?: { historyCount?: number; hasMedia?: boolean },
): Promise<AnalysisResultV2> {
  const profile = resolveScoringProfile(platform, contentType);
  const confidence = estimateConfidence({
    historyCount: opts?.historyCount ?? 0,
    hasMedia: opts?.hasMedia ?? false,
    descriptionLength: (description || "").length,
  });

  const prompt = buildPrompt({
    title: title || "Untitled",
    description: description || "No description provided",
    platform: platform || "general",
    contentType: contentType || "video",
    profileFocus: profile.focus,
    profileVersion: profile.version,
    hookWindowSeconds: profile.hookWindowSeconds,
  });

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL || "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a viral content expert. Always respond with valid JSON only, no markdown or extra text.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const cleanContent = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const parsed = JSON.parse(cleanContent) as Partial<AnalysisResultV2>;

    return clampResult(
      parsed,
      profile.version,
      confidence,
      title || "Untitled",
      description || "",
      platform || "youtube",
    );
  } catch (error) {
    console.error("Analysis error:", error);
    throw new Error("Failed to analyze content");
  }
}

/**
 * Full pipeline with stage callbacks — sync runner (Inngest-compatible shape).
 * When INNGEST_EVENT_KEY is set later, wrap this in an Inngest function.
 */
export async function analyzeWithPipeline(
  input: {
    title: string;
    description: string;
    platform: string;
    contentType: string;
    hasMedia?: boolean;
    historyCount?: number;
  },
  onStage?: StageListener,
): Promise<AnalysisResultV2> {
  let result!: AnalysisResultV2;

  await runAnalysisPipeline({
    hasMedia: !!input.hasMedia,
    onStage,
    runScore: async () => {
      result = await analyzeContent(
        input.title,
        input.description,
        input.platform,
        input.contentType,
        {
          historyCount: input.historyCount,
          hasMedia: input.hasMedia,
        },
      );
    },
    persist: async () => {
      // Caller persists; stage exists so UI progress hits 100%
    },
  });

  return result;
}

export async function saveAnalysis(
  userId: string,
  title: string,
  description: string,
  platform: string,
  contentType: string,
  result: AnalysisResultV2,
) {
  const [analysis] = await db
    .insert(contentAnalyses)
    .values({
      userId,
      title,
      description,
      targetPlatform: platform,
      contentType,
      viralScore: result.viralScore,
      hookScore: result.hookScore,
      visualScore: result.visualScore,
      structureScore: result.structureScore,
      metadataScore: result.metadataScore,
      timingScore: result.timingScore,
      analysisResults: result,
      suggestions: result.top3Fixes,
      status: "analyzed",
    })
    .returning();

  // Seed history with version 1
  await db.insert(analysisHistory).values({
    contentId: analysis.id,
    viralScore: result.viralScore,
    analysisResults: result,
    suggestions: result.top3Fixes,
  });

  return analysis;
}

export async function reanalyzeContent(
  analysisId: string,
  userId: string,
  updates: {
    title?: string;
    description?: string;
    platform?: string;
    contentType?: string;
    appliedFixIndexes?: number[];
  },
  onStage?: StageListener,
): Promise<{
  analysis: typeof contentAnalyses.$inferSelect;
  result: AnalysisResultV2;
  diff: ScoreDiff;
}> {
  const existing = await getAnalysis(analysisId, userId);
  if (!existing) {
    throw new Error("Analysis not found");
  }

  const prevResults = (existing.analysisResults || {}) as Partial<AnalysisResultV2>;
  const title = updates.title ?? existing.title ?? "Untitled";
  const description = updates.description ?? existing.description ?? "";
  const platform =
    updates.platform ?? existing.targetPlatform ?? "youtube";
  const contentType = updates.contentType ?? existing.contentType ?? "video";

  // Snapshot previous into history before overwrite
  await db.insert(analysisHistory).values({
    contentId: existing.id,
    viralScore: existing.viralScore,
    analysisResults: existing.analysisResults,
    suggestions: existing.suggestions,
  });

  const historyCount = await countAnalysesForUser(userId);
  const result = await analyzeWithPipeline(
    {
      title,
      description,
      platform,
      contentType,
      hasMedia: !!existing.fileUrl,
      historyCount,
    },
    onStage,
  );

  const [updated] = await db
    .update(contentAnalyses)
    .set({
      title,
      description,
      targetPlatform: platform,
      contentType,
      viralScore: result.viralScore,
      hookScore: result.hookScore,
      visualScore: result.visualScore,
      structureScore: result.structureScore,
      metadataScore: result.metadataScore,
      timingScore: result.timingScore,
      analysisResults: result,
      suggestions: result.top3Fixes,
      status: "analyzed",
      updatedAt: new Date(),
    })
    .where(eq(contentAnalyses.id, analysisId))
    .returning();

  const appliedFixes =
    updates.appliedFixIndexes && prevResults.top3Fixes
      ? updates.appliedFixIndexes
          .map((i) => prevResults.top3Fixes?.[i])
          .filter(Boolean) as FixSuggestion[]
      : [];

  const diff = buildScoreDiff(
    {
      viralScore: existing.viralScore ?? 0,
      hookScore: existing.hookScore ?? 0,
      visualScore: existing.visualScore ?? 0,
      structureScore: existing.structureScore ?? 0,
      metadataScore: existing.metadataScore ?? 0,
      timingScore: existing.timingScore ?? 0,
    },
    result,
    appliedFixes,
  );

  return { analysis: updated, result, diff };
}

export async function getAnalysisHistory(analysisId: string, userId: string) {
  const analysis = await getAnalysis(analysisId, userId);
  if (!analysis) return null;

  const rows = await db
    .select()
    .from(analysisHistory)
    .where(eq(analysisHistory.contentId, analysisId))
    .orderBy(desc(analysisHistory.analyzedAt));

  return rows;
}

export async function countAnalysesForUser(userId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(contentAnalyses)
    .where(eq(contentAnalyses.userId, userId));
  return row?.value ?? 0;
}

export async function getRecentAnalyses(userId: string, limit: number = 10) {
  return db
    .select()
    .from(contentAnalyses)
    .where(eq(contentAnalyses.userId, userId))
    .orderBy(desc(contentAnalyses.createdAt))
    .limit(limit);
}

export async function getAllAnalyses(userId: string) {
  return db
    .select()
    .from(contentAnalyses)
    .where(eq(contentAnalyses.userId, userId))
    .orderBy(desc(contentAnalyses.createdAt));
}

export async function getAnalysis(id: string, userId: string) {
  const [analysis] = await db
    .select()
    .from(contentAnalyses)
    .where(eq(contentAnalyses.id, id));

  if (analysis && analysis.userId !== userId) {
    return null;
  }

  return analysis;
}

export async function getUserStats(userId: string) {
  const analyses = await db
    .select()
    .from(contentAnalyses)
    .where(eq(contentAnalyses.userId, userId));

  if (analyses.length === 0) {
    return { avgScore: 0, totalAnalyses: 0, improvement: 0 };
  }

  const avgScore = Math.round(
    analyses.reduce((sum, a) => sum + (a.viralScore || 0), 0) / analyses.length,
  );

  // Improvement: last vs first viral score when we have history depth
  const sorted = [...analyses].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const first = sorted[0]?.viralScore ?? 0;
  const last = sorted[sorted.length - 1]?.viralScore ?? 0;

  return {
    avgScore,
    totalAnalyses: analyses.length,
    improvement: last - first,
  };
}

export async function decrementUserCredits(userId: string, amount = 1) {
  const cost = Math.max(1, Math.round(amount));
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return false;

  const currentCredits = user.creditsRemaining ?? 10;
  if (currentCredits <= 0) return false;

  await db
    .update(users)
    .set({ creditsRemaining: Math.max(0, currentCredits - cost) })
    .where(eq(users.id, userId));

  return true;
}

export { PIPELINE_STAGES, buildScoreDiff };
export type { ScoreDiff, FixSuggestion, AnalysisResultV2 };
