import type { Express, Request, Response } from "express";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { db } from "./db";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { isAuthenticated } from "./auth";
import {
  missions,
  missionRuns,
  missionSteps,
  missionAudit,
  learningEvents,
  socialConnections,
  users,
  insertMissionSchema,
} from "@shared/schema";
import { generateDraftForRun, proposeIdeasForRun, selectIdeaForRun, regenerateRun, approveRun, rejectRun, publishRun, autopilotTick, getAccuracySummary } from "./agent";
import {
  buildAuthUrl,
  exchangeCodeForToken,
  fetchProfile,
  saveConnection,
  disconnectLinkedIn,
  isLinkedInConfigured,
  getConnectionForUser,
  generatePkcePair,
} from "./integrations/linkedin";
import * as xApi from "./integrations/x";
import * as threadsApi from "./integrations/threads";
import * as instagramApi from "./integrations/instagram";
import { randomBytes } from "crypto";

const userId = (req: Request) => (req.user as any).claims?.sub || (req.user as any).id;

function callbackUrl(req: Request, provider: string = "linkedin"): string {
  const proto = (req.headers["x-forwarded-proto"] as string)?.split(",")[0] || req.protocol || "https";
  return `${proto}://${req.get("host")}/api/${provider}/callback`;
}

export function registerAutopilotRoutes(app: Express) {
  // ============ LinkedIn OAuth ============
  app.get("/api/linkedin/status", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const conn = await getConnectionForUser(uid);
    res.json({
      configured: isLinkedInConfigured(),
      connected: !!conn,
      // Onboarding/Settings UI reads `account.displayName` (and a few legacy
      // surfaces still read `profileName` at the top level), so include both.
      profileName: conn?.displayName ?? null,
      account: conn ? { displayName: conn.displayName, profileUrl: conn.profileUrl, connectedAt: conn.createdAt } : null,
    });
  });

  app.get("/api/linkedin/connect", isAuthenticated, async (req, res) => {
    if (!isLinkedInConfigured()) {
      return res.status(503).send("LinkedIn integration not configured. Ask the admin to set LINKEDIN_CLIENT_ID/SECRET.");
    }
    const state = randomBytes(16).toString("hex");
    const { verifier, challenge } = generatePkcePair();
    (req.session as any).linkedinState = state;
    (req.session as any).linkedinUserId = userId(req);
    (req.session as any).linkedinPkceVerifier = verifier;
    res.redirect(buildAuthUrl(callbackUrl(req), state, challenge));
  });

  app.get("/api/linkedin/callback", async (req, res) => {
    const code = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;
    const sessionState = (req.session as any).linkedinState;
    const sessionUid = (req.session as any).linkedinUserId;
    if (!code || !state || state !== sessionState || !sessionUid) {
      return res.redirect("/settings?linkedin=error");
    }
    try {
      const verifier = (req.session as any).linkedinPkceVerifier as string | undefined;
      delete (req.session as any).linkedinPkceVerifier;
      delete (req.session as any).linkedinState;
      const tok = await exchangeCodeForToken(code, callbackUrl(req), verifier);
      const profile = await fetchProfile(tok.access_token);
      await saveConnection({
        userId: sessionUid,
        providerAccountId: profile.sub,
        displayName: profile.name,
        profileUrl: undefined,
        accessToken: tok.access_token,
        refreshToken: tok.refresh_token ?? null,
        expiresInSeconds: tok.expires_in,
        scope: tok.scope,
      });
      // Audit OAuth grant — every external side-effect leaves a trail.
      await db.insert(missionAudit).values({
        userId: sessionUid,
        event: "oauth.linkedin.grant",
        meta: { providerAccountId: profile.sub, scope: tok.scope ?? null },
      });
      res.redirect("/autopilot?connected=1");
    } catch (e: any) {
      console.error("LinkedIn callback error:", e?.message || e);
      res.redirect("/settings?linkedin=error");
    }
  });

  app.post("/api/linkedin/disconnect", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const result = await disconnectLinkedIn(uid);
    await db.insert(missionAudit).values({
      userId: uid,
      event: "oauth.linkedin.revoke",
      meta: { revokedRemote: result.revokedRemote, reason: result.reason ?? null },
    });
    res.json({ ok: true, ...result });
  });

  // ============ X (Twitter) OAuth ============
  app.get("/api/x/status", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const conn = await xApi.getConnectionForUser(uid);
    res.json({
      configured: xApi.isXConfigured(),
      connected: !!conn,
      profileName: conn?.displayName ?? null,
      account: conn ? { displayName: conn.displayName, profileUrl: conn.profileUrl, connectedAt: conn.createdAt } : null,
    });
  });

  app.get("/api/x/connect", isAuthenticated, async (req, res) => {
    if (!xApi.isXConfigured()) {
      return res.status(503).send("X integration not configured. Ask the admin to set X_CLIENT_ID/SECRET.");
    }
    const state = randomBytes(16).toString("hex");
    const { verifier, challenge } = xApi.generatePkcePair();
    (req.session as any).xState = state;
    (req.session as any).xUserId = userId(req);
    (req.session as any).xPkceVerifier = verifier;
    res.redirect(xApi.buildAuthUrl(callbackUrl(req, "x"), state, challenge));
  });

  app.get("/api/x/callback", async (req, res) => {
    const code = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;
    const sessionState = (req.session as any).xState;
    const sessionUid = (req.session as any).xUserId;
    const verifier = (req.session as any).xPkceVerifier as string | undefined;
    if (!code || !state || state !== sessionState || !sessionUid || !verifier) {
      return res.redirect("/settings?x=error");
    }
    delete (req.session as any).xState;
    delete (req.session as any).xPkceVerifier;
    try {
      const tok = await xApi.exchangeCodeForToken(code, callbackUrl(req, "x"), verifier);
      const profile = await xApi.fetchProfile(tok.access_token);
      const displayName: string | undefined = profile.username || profile.name || undefined;
      await xApi.saveConnection({
        userId: sessionUid,
        providerAccountId: profile.id,
        displayName,
        profileUrl: profile.username ? `https://x.com/${profile.username}` : undefined,
        accessToken: tok.access_token,
        refreshToken: tok.refresh_token ?? null,
        expiresInSeconds: tok.expires_in,
        scope: tok.scope,
      });
      await db.insert(missionAudit).values({
        userId: sessionUid,
        event: "oauth.x.grant",
        meta: { providerAccountId: profile.id, scope: tok.scope ?? null },
      });
      res.redirect("/autopilot?connected=x");
    } catch (e: any) {
      console.error("X callback error:", e?.message || e);
      res.redirect("/settings?x=error");
    }
  });

  app.post("/api/x/disconnect", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const result = await xApi.disconnectX(uid);
    await db.insert(missionAudit).values({
      userId: uid,
      event: "oauth.x.revoke",
      meta: { revokedRemote: result.revokedRemote, reason: result.reason ?? null },
    });
    res.json({ ok: true, ...result });
  });

  // ============ Threads OAuth ============
  app.get("/api/threads/status", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const conn = await threadsApi.getConnectionForUser(uid);
    res.json({
      configured: threadsApi.isThreadsConfigured(),
      connected: !!conn,
      profileName: conn?.displayName ?? null,
      account: conn ? { displayName: conn.displayName, profileUrl: conn.profileUrl, connectedAt: conn.createdAt } : null,
    });
  });

  app.get("/api/threads/connect", isAuthenticated, async (req, res) => {
    if (!threadsApi.isThreadsConfigured()) {
      return res.status(503).send("Threads integration not configured. Ask the admin to set THREADS_CLIENT_ID/SECRET.");
    }
    const state = randomBytes(16).toString("hex");
    (req.session as any).threadsState = state;
    (req.session as any).threadsUserId = userId(req);
    res.redirect(threadsApi.buildAuthUrl(callbackUrl(req, "threads"), state));
  });

  app.get("/api/threads/callback", async (req, res) => {
    const code = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;
    const sessionState = (req.session as any).threadsState;
    const sessionUid = (req.session as any).threadsUserId;
    if (!code || !state || state !== sessionState || !sessionUid) {
      return res.redirect("/settings?threads=error");
    }
    delete (req.session as any).threadsState;
    try {
      const tok = await threadsApi.exchangeCodeForToken(code, callbackUrl(req, "threads"));
      const profile = await threadsApi.fetchProfile(tok.access_token, tok.user_id);
      await threadsApi.saveConnection({
        userId: sessionUid,
        providerAccountId: profile.id,
        displayName: profile.username || profile.name,
        profileUrl: profile.username ? `https://www.threads.net/@${profile.username}` : undefined,
        accessToken: tok.access_token,
        expiresInSeconds: tok.expires_in,
      });
      await db.insert(missionAudit).values({
        userId: sessionUid,
        event: "oauth.threads.grant",
        meta: { providerAccountId: profile.id },
      });
      res.redirect("/autopilot?connected=threads");
    } catch (e: any) {
      console.error("Threads callback error:", e?.message || e);
      res.redirect("/settings?threads=error");
    }
  });

  app.post("/api/threads/disconnect", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const result = await threadsApi.disconnectThreads(uid);
    await db.insert(missionAudit).values({
      userId: uid,
      event: "oauth.threads.revoke",
      meta: { revokedRemote: result.revokedRemote, reason: result.reason ?? null },
    });
    res.json({ ok: true, ...result });
  });

  // ============ Instagram OAuth ============
  app.get("/api/instagram/status", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const conn = await instagramApi.getConnectionForUser(uid);
    res.json({
      configured: instagramApi.isInstagramConfigured(),
      connected: !!conn,
      profileName: conn?.displayName ?? null,
      account: conn ? { displayName: conn.displayName, profileUrl: conn.profileUrl, connectedAt: conn.createdAt } : null,
    });
  });

  app.get("/api/instagram/connect", isAuthenticated, async (req, res) => {
    if (!instagramApi.isInstagramConfigured()) {
      return res.status(503).send("Instagram integration not configured. Ask the admin to set INSTAGRAM_CLIENT_ID/SECRET.");
    }
    const state = randomBytes(16).toString("hex");
    (req.session as any).instagramState = state;
    (req.session as any).instagramUserId = userId(req);
    res.redirect(instagramApi.buildAuthUrl(callbackUrl(req, "instagram"), state));
  });

  app.get("/api/instagram/callback", async (req, res) => {
    const code = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;
    const sessionState = (req.session as any).instagramState;
    const sessionUid = (req.session as any).instagramUserId;
    if (!code || !state || state !== sessionState || !sessionUid) {
      return res.redirect("/settings?instagram=error");
    }
    delete (req.session as any).instagramState;
    try {
      const tok = await instagramApi.exchangeCodeForToken(code, callbackUrl(req, "instagram"));
      const profile = await instagramApi.fetchProfile(tok.access_token);
      if (!profile) {
        // Honest failure: we can connect to Facebook but the user has no
        // IG-Business account linked to any of their Pages, so we can't
        // publish or measure. Tell them instead of silently storing a
        // useless token.
        return res.redirect("/settings?instagram=no-business-account");
      }
      await instagramApi.saveConnection({
        userId: sessionUid,
        providerAccountId: profile.id,
        displayName: profile.username || profile.name,
        profileUrl: profile.username ? `https://www.instagram.com/${profile.username}` : undefined,
        accessToken: tok.access_token,
        expiresInSeconds: tok.expires_in,
      });
      await db.insert(missionAudit).values({
        userId: sessionUid,
        event: "oauth.instagram.grant",
        meta: { providerAccountId: profile.id },
      });
      res.redirect("/autopilot?connected=instagram");
    } catch (e: any) {
      console.error("Instagram callback error:", e?.message || e);
      res.redirect("/settings?instagram=error");
    }
  });

  app.post("/api/instagram/disconnect", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const result = await instagramApi.disconnectInstagram(uid);
    await db.insert(missionAudit).values({
      userId: uid,
      event: "oauth.instagram.revoke",
      meta: { revokedRemote: result.revokedRemote, reason: result.reason ?? null },
    });
    res.json({ ok: true, ...result });
  });

  // ============ Missions ============
  app.get("/api/missions", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const list = await db
      .select()
      .from(missions)
      .where(eq(missions.userId, uid))
      .orderBy(desc(missions.createdAt));
    res.json(list);
  });

  // Keep `name` and `brief` required — every other field has a server-side
  // default. Marking those optional would let an empty payload reach the DB
  // and surface as a 500 instead of a clean validation error.
  const createMissionInput = insertMissionSchema.partial({
    platform: true, cadence: true, postsPerWeek: true, approvalMode: true,
    useBrandVoice: true, status: true, goalMetric: true, goalTarget: true,
  }).extend({
    name: z.string().min(1, "name is required").max(120),
    brief: z.string().min(1, "brief is required").max(4000),
  });

  app.post("/api/missions", isAuthenticated, async (req, res) => {
    const parsed = createMissionInput.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: fromError(parsed.error).toString() });
    const uid = userId(req);
    const platform = parsed.data.platform || "linkedin";
    const [row] = await db
      .insert(missions)
      .values({ ...parsed.data, userId: uid, platform })
      .returning();
    await db.insert(missionAudit).values({ userId: uid, missionId: row.id, event: "mission.created", meta: { name: row.name } });
    // Queue the first run as `pending`. The scheduler tick (drained
    // immediately via setImmediate so UX still feels instant) is the *only*
    // place that turns pending runs into drafts — handlers do no long work.
    const [firstRun] = await db.insert(missionRuns).values({ missionId: row.id, userId: uid, status: "pending" }).returning();
    setImmediate(() => autopilotTick().catch((e) => console.error("tick after mission create failed:", e?.message || e)));
    res.json({ ...row, firstRunId: firstRun.id });
  });

  app.patch("/api/missions/:id", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const [m] = await db.select().from(missions).where(and(eq(missions.id, req.params.id), eq(missions.userId, uid)));
    if (!m) return res.status(404).json({ error: "not-found" });
    const allowed = ["name", "brief", "cadence", "postsPerWeek", "approvalMode", "useBrandVoice", "status", "goalMetric", "goalTarget"];
    const patch: Record<string, any> = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    patch.updatedAt = new Date();
    const [row] = await db.update(missions).set(patch).where(eq(missions.id, m.id)).returning();
    res.json(row);
  });

  app.delete("/api/missions/:id", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    await db.delete(missions).where(and(eq(missions.id, req.params.id), eq(missions.userId, uid)));
    res.json({ ok: true });
  });

  // ============ Runs ============
  app.get("/api/missions/:id/runs", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const [m] = await db.select().from(missions).where(and(eq(missions.id, req.params.id), eq(missions.userId, uid)));
    if (!m) return res.status(404).json({ error: "not-found" });
    const runs = await db
      .select()
      .from(missionRuns)
      .where(eq(missionRuns.missionId, m.id))
      .orderBy(desc(missionRuns.createdAt))
      .limit(50);
    res.json(runs);
  });

  app.post("/api/missions/:id/runs", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const [m] = await db.select().from(missions).where(and(eq(missions.id, req.params.id), eq(missions.userId, uid)));
    if (!m) return res.status(404).json({ error: "not-found" });
    // Manual run requests are queued the same way mission creation is —
    // status=pending plus an optional autoApprove hint, then the scheduler
    // tick (kicked immediately via setImmediate) drains it. Handlers stay
    // thin and the run lifecycle has a single owner.
    const [run] = await db
      .insert(missionRuns)
      .values({ missionId: m.id, userId: uid, status: "pending", regenerationFeedback: req.body?.auto ? "__AUTO__" : null })
      .returning();
    setImmediate(() => autopilotTick().catch((e) => console.error("tick after manual run failed:", e?.message || e)));
    res.json(run);
  });

  // Idea-selection gate: user picks one of the candidate ideas to draft.
  app.post("/api/runs/:id/select-idea", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const [run] = await db.select().from(missionRuns).where(and(eq(missionRuns.id, req.params.id), eq(missionRuns.userId, uid)));
    if (!run) return res.status(404).json({ error: "not-found" });
    const idx = Number(req.body?.index);
    if (!Number.isInteger(idx) || idx < 0) return res.status(400).json({ error: "invalid-index" });
    try {
      // Handler is thin — selectIdeaForRun only flips status to
      // pending_draft + records the pick. The tick (kicked here so the
      // user sees the inspector advance immediately, not 5 minutes later)
      // owns the actual draft pipeline.
      await selectIdeaForRun(run.id, idx);
      setImmediate(() => autopilotTick().catch((e) => console.error("tick after select-idea failed:", e?.message || e)));
      res.json({ ok: true, runId: run.id });
    } catch (e: any) {
      res.status(400).json({ error: String(e?.message || e) });
    }
  });

  // Run-level pause / resume / cancel — granular control beyond the global
  // kill switch. Honoured by publishRun and the autopilot tick.
  app.post("/api/runs/:id/pause", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const [run] = await db.select().from(missionRuns).where(and(eq(missionRuns.id, req.params.id), eq(missionRuns.userId, uid)));
    if (!run) return res.status(404).json({ error: "not-found" });
    if (["posted", "complete", "cancelled", "rejected", "failed"].includes(run.status)) return res.status(400).json({ error: `cannot-pause-from-${run.status}` });
    await db.update(missionRuns).set({ status: "paused", updatedAt: new Date() }).where(eq(missionRuns.id, run.id));
    await db.insert(missionAudit).values({ userId: uid, missionId: run.missionId, runId: run.id, event: "run.paused" });
    res.json({ ok: true });
  });

  app.post("/api/runs/:id/resume", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const [run] = await db.select().from(missionRuns).where(and(eq(missionRuns.id, req.params.id), eq(missionRuns.userId, uid)));
    if (!run) return res.status(404).json({ error: "not-found" });
    if (run.status !== "paused") return res.status(400).json({ error: `cannot-resume-from-${run.status}` });
    // Resume to whichever gate the run was at: if it has finalText, back to
    // approval; if it has proposedIdeas, back to idea selection; else pending.
    const next = run.finalText ? "awaiting_approval" : run.proposedIdeas ? "awaiting_idea" : "pending";
    await db.update(missionRuns).set({ status: next, updatedAt: new Date() }).where(eq(missionRuns.id, run.id));
    await db.insert(missionAudit).values({ userId: uid, missionId: run.missionId, runId: run.id, event: "run.resumed", meta: { to: next } });
    res.json({ ok: true, status: next });
  });

  app.post("/api/runs/:id/cancel", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const [run] = await db.select().from(missionRuns).where(and(eq(missionRuns.id, req.params.id), eq(missionRuns.userId, uid)));
    if (!run) return res.status(404).json({ error: "not-found" });
    if (["posted", "complete", "cancelled"].includes(run.status)) return res.status(400).json({ error: `cannot-cancel-from-${run.status}` });
    await db.update(missionRuns).set({ status: "cancelled", updatedAt: new Date() }).where(eq(missionRuns.id, run.id));
    await db.insert(missionAudit).values({ userId: uid, missionId: run.missionId, runId: run.id, event: "run.cancelled" });
    res.json({ ok: true });
  });

  // Per-mission credit/cost rollup for the inspector header.
  app.get("/api/missions/:id/cost", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const [m] = await db.select().from(missions).where(and(eq(missions.id, req.params.id), eq(missions.userId, uid)));
    if (!m) return res.status(404).json({ error: "not-found" });
    const runs = await db.select({ id: missionRuns.id }).from(missionRuns).where(eq(missionRuns.missionId, m.id));
    const ids = runs.map((r) => r.id);
    if (!ids.length) return res.json({ runs: 0, steps: 0, tokens: 0, credits: 0 });
    // Aggregate in SQL — scanning the whole mission_steps table in Node
    // does not scale once a workspace has thousands of runs.
    const [agg] = await db
      .select({
        steps: sql<number>`count(*)::int`,
        tokens: sql<number>`coalesce(sum(${missionSteps.tokenCost}), 0)::int`,
        credits: sql<number>`coalesce(sum(${missionSteps.creditCost}), 0)::int`,
      })
      .from(missionSteps)
      .where(inArray(missionSteps.runId, ids));
    res.json({ runs: ids.length, steps: agg?.steps ?? 0, tokens: agg?.tokens ?? 0, credits: agg?.credits ?? 0 });
  });

  // Reject → regenerate loop. POST without `regenerate: true` simply rejects;
  // with `regenerate: true` we create a sibling run carrying the feedback.
  app.post("/api/runs/:id/regenerate", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const [run] = await db.select().from(missionRuns).where(and(eq(missionRuns.id, req.params.id), eq(missionRuns.userId, uid)));
    if (!run) return res.status(404).json({ error: "not-found" });
    try {
      const next = await regenerateRun(run.id, String(req.body?.feedback || ""));
      // regenerateRun only inserts the pending row; kick the tick so the
      // user sees the new draft appear quickly.
      setImmediate(() => autopilotTick().catch((e) => console.error("tick after regenerate failed:", e?.message || e)));
      res.json(next);
    } catch (e: any) {
      res.status(400).json({ error: String(e?.message || e) });
    }
  });

  app.get("/api/runs/:id", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const [run] = await db.select().from(missionRuns).where(and(eq(missionRuns.id, req.params.id), eq(missionRuns.userId, uid)));
    if (!run) return res.status(404).json({ error: "not-found" });
    const steps = await db.select().from(missionSteps).where(eq(missionSteps.runId, run.id)).orderBy(asc(missionSteps.ord));
    res.json({ run, steps });
  });

  const approveSchema = z.object({
    finalText: z.string().trim().min(1).max(5000).optional(),
    finalHashtags: z.array(z.string().trim().max(60)).max(20).optional(),
    scheduledFor: z.string().datetime().optional(),
  });

  app.post("/api/runs/:id/approve", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const [run] = await db.select().from(missionRuns).where(and(eq(missionRuns.id, req.params.id), eq(missionRuns.userId, uid)));
    if (!run) return res.status(404).json({ error: "not-found" });
    const parsed = approveSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: fromError(parsed.error).toString() });
    try {
      const updated = await approveRun(run.id, {
        finalText: parsed.data.finalText,
        finalHashtags: parsed.data.finalHashtags,
        scheduledFor: parsed.data.scheduledFor ? new Date(parsed.data.scheduledFor) : undefined,
      });
      // The scheduler tick is the only place that calls LinkedIn. Even
      // for "post now" approvals we just kick the tick — keeps handlers
      // free of long-running side effects and gives us one retry/rate-limit
      // surface.
      setImmediate(() => autopilotTick().catch((e) => console.error("tick after approve failed:", e?.message || e)));
      res.json(updated);
    } catch (e: any) {
      res.status(400).json({ error: String(e?.message || e) });
    }
  });

  app.post("/api/runs/:id/reject", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const [run] = await db.select().from(missionRuns).where(and(eq(missionRuns.id, req.params.id), eq(missionRuns.userId, uid)));
    if (!run) return res.status(404).json({ error: "not-found" });
    if (req.body?.regenerate) {
      try {
        const next = await regenerateRun(run.id, String(req.body?.reason || req.body?.feedback || ""));
        setImmediate(() => autopilotTick().catch((e) => console.error("tick after reject+regenerate failed:", e?.message || e)));
        return res.json({ ok: true, regeneratedAs: next.id });
      } catch (e: any) {
        return res.status(400).json({ error: String(e?.message || e) });
      }
    }
    await rejectRun(run.id, String(req.body?.reason || ""));
    res.json({ ok: true });
  });

  // ============ Kill switch + global state ============
  app.get("/api/autopilot/state", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const [u] = await db.select().from(users).where(eq(users.id, uid));
    const allMissions = await db.select().from(missions).where(eq(missions.userId, uid));
    const recent = await db
      .select()
      .from(missionRuns)
      .where(eq(missionRuns.userId, uid))
      .orderBy(desc(missionRuns.createdAt))
      .limit(10);
    res.json({
      paused: !!u?.autopilotPaused,
      linkedinConfigured: isLinkedInConfigured(),
      xConfigured: xApi.isXConfigured(),
      threadsConfigured: threadsApi.isThreadsConfigured(),
      instagramConfigured: instagramApi.isInstagramConfigured(),
      missions: allMissions.length,
      activeMissions: allMissions.filter((m) => m.status === "active").length,
      awaitingApproval: recent.filter((r) => r.status === "awaiting_approval").length,
      recentRuns: recent,
    });
  });

  app.post("/api/autopilot/pause", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const paused = !!req.body?.paused;
    await db.update(users).set({ autopilotPaused: paused, updatedAt: new Date() }).where(eq(users.id, uid));
    await db.insert(missionAudit).values({ userId: uid, event: paused ? "killswitch.engaged" : "killswitch.released" });
    res.json({ paused });
  });

  app.get("/api/autopilot/audit", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const rows = await db
      .select()
      .from(missionAudit)
      .where(eq(missionAudit.userId, uid))
      .orderBy(desc(missionAudit.at))
      .limit(100);
    res.json(rows);
  });

  // Prediction accuracy summary for the /autopilot dashboard card. Returns
  // MAE per platform + the agent's top-three learnings for the past week.
  // Cached server-side per user; safe to call on every page load.
  app.get("/api/autopilot/accuracy", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    try {
      const data = await getAccuracySummary(uid);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: String(e?.message || e) });
    }
  });

  app.get("/api/autopilot/learnings", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const rows = await db
      .select()
      .from(learningEvents)
      .where(eq(learningEvents.userId, uid))
      .orderBy(desc(learningEvents.createdAt))
      .limit(50);
    res.json(rows);
  });

  // Manual tick — runs the global scheduler. Restricted to dev mode or
  // explicit admin allow-list to avoid cross-tenant side effects in prod.
  app.post("/api/autopilot/tick", isAuthenticated, async (req, res) => {
    const uid = userId(req);
    const isDev = process.env.NODE_ENV !== "production";
    const allow = (process.env.AUTOPILOT_TICK_ADMINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!isDev && !allow.includes(uid)) {
      return res.status(403).json({ error: "forbidden" });
    }
    const result = await autopilotTick();
    res.json(result);
  });
}
