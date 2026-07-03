import type { Express, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { db } from "./db";
import { and, desc, eq, gte, lt } from "drizzle-orm";
import { isAuthenticated } from "./auth";
import {
  intelCompetitors,
  intelCompetitorPosts,
  intelCompetitorDigests,
  intelHiringSignals,
  intelFundingSignals,
  intelPodcastSignals,
  intelSignalCorrelations,
  users,
  insertIntelCompetitorSchema,
} from "@shared/schema";
import { refreshAndDigest, refreshCompetitor, refreshSignals, correlateSignals, generateWeeklyDigest, getLatestDigest, isoWeekStart } from "./intelligence";

const userId = (req: Request) => (req.user as any).claims?.sub || (req.user as any).id;

// Plan gating per Module 1 spec: free/pro tiers cap at 1 tracked competitor;
// the paid Signal tier ('signal' or legacy 'team') unlocks 5. Reuses the
// existing `users.plan` field rather than introducing a new billing flow.
function planCap(plan: string | null | undefined): number {
  if (plan === "signal" || plan === "team") return 5;
  return 1;
}

type IntelligenceRequest = Request & { intel?: { planCap: number; planName: string } };

// `requirePlan('intelligence')` gate. Every intelligence route runs after
// isAuthenticated and through this guard, which loads the user's plan once
// and attaches the cap to a typed `req.intel` field used by the handlers.
async function requireIntelligencePlan(req: IntelligenceRequest, res: Response, next: NextFunction) {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ error: "Not authenticated" });
  const [me] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  if (!me) return res.status(401).json({ error: "Account not found" });
  req.intel = { planCap: planCap(me.plan), planName: me.plan ?? "free" };
  next();
}

async function loadCompetitor(uid: string, id: string) {
  const [c] = await db
    .select()
    .from(intelCompetitors)
    .where(and(eq(intelCompetitors.id, id), eq(intelCompetitors.userId, uid)))
    .limit(1);
  return c ?? null;
}

const createSchema = insertIntelCompetitorSchema
  .extend({
    name: z.string().min(2).max(160),
    websiteUrl: z.string().url().optional().nullable(),
    blogRssUrl: z.string().url().optional().nullable(),
    xHandle: z.string().max(64).optional().nullable(),
    linkedinCompanyUrl: z.string().url().optional().nullable(),
    jobBoardUrl: z.string().url().optional().nullable(),
    fundingRssUrl: z.string().url().optional().nullable(),
    execNames: z.array(z.string().min(1).max(200)).max(5).optional().nullable(),
  })
  .omit({ userId: true })
  .refine(
    (v) => !!(v.blogRssUrl || v.xHandle || v.linkedinCompanyUrl),
    { message: "Provide at least one source (blog RSS, X handle, or LinkedIn company URL)." },
  );

export function registerIntelligenceRoutes(app: Express) {
  // List competitors (with latest digest preview)
  app.get("/api/intelligence/competitors", isAuthenticated, requireIntelligencePlan, async (req: IntelligenceRequest, res) => {
    const uid = userId(req);
    const rows = await db
      .select()
      .from(intelCompetitors)
      .where(eq(intelCompetitors.userId, uid))
      .orderBy(desc(intelCompetitors.createdAt));
    const enriched = await Promise.all(
      rows.map(async (c) => ({ ...c, latestDigest: await getLatestDigest(c.id) })),
    );
    res.json({
      competitors: enriched,
      planCap: req.intel!.planCap,
      plan: req.intel!.planName,
    });
  });

  app.post("/api/intelligence/competitors", isAuthenticated, requireIntelligencePlan, async (req: IntelligenceRequest, res) => {
    const uid = userId(req);
    try {
      const data = createSchema.parse(req.body);
      const cap = req.intel!.planCap;
      const planName = req.intel!.planName;
      const existing = await db
        .select({ id: intelCompetitors.id })
        .from(intelCompetitors)
        .where(eq(intelCompetitors.userId, uid));
      if (existing.length >= cap) {
        return res.status(403).json({
          error: `Your ${planName} plan tracks up to ${cap} ${cap === 1 ? "competitor" : "competitors"}. Upgrade to track more.`,
        });
      }
      const [row] = await db
        .insert(intelCompetitors)
        .values({
          userId: uid,
          name: data.name,
          websiteUrl: data.websiteUrl || null,
          blogRssUrl: data.blogRssUrl || null,
          xHandle: data.xHandle ? data.xHandle.replace(/^@/, "").trim() : null,
          linkedinCompanyUrl: data.linkedinCompanyUrl || null,
          jobBoardUrl: data.jobBoardUrl || null,
          fundingRssUrl: data.fundingRssUrl || null,
          execNames: data.execNames && data.execNames.length > 0 ? data.execNames : null,
          emailDigestEnabled: data.emailDigestEnabled ?? true,
        })
        .returning();
      // Kick off an initial refresh + digest in the background so the user
      // sees something within seconds. Do not block the API response.
      // Initial refresh targets the current in-progress ISO week so a brand-new
      // competitor immediately shows fresh data instead of last week's digest.
      refreshAndDigest(row, isoWeekStart(new Date())).catch(() => {});
      res.json(row);
    } catch (e) {
      res.status(400).json({ error: fromError(e).message });
    }
  });

  app.get("/api/intelligence/competitors/:id", isAuthenticated, requireIntelligencePlan, async (req, res) => {
    const uid = userId(req);
    const c = await loadCompetitor(uid, req.params.id);
    if (!c) return res.status(404).json({ error: "Not found" });
    const digests = await db
      .select()
      .from(intelCompetitorDigests)
      .where(eq(intelCompetitorDigests.competitorId, c.id))
      .orderBy(desc(intelCompetitorDigests.weekStart))
      .limit(8);
    res.json({ competitor: c, digests });
  });

  app.get("/api/intelligence/competitors/:id/digest", isAuthenticated, requireIntelligencePlan, async (req, res) => {
    const uid = userId(req);
    const c = await loadCompetitor(uid, req.params.id);
    if (!c) return res.status(404).json({ error: "Not found" });
    let ws: Date | undefined;
    if (req.query.week) {
      const week = new Date(String(req.query.week));
      if (isNaN(week.getTime())) {
        return res.status(400).json({ error: "Invalid `week` query parameter. Expected an ISO date." });
      }
      ws = isoWeekStart(week);
    }
    let digest = ws
      ? (await db
          .select()
          .from(intelCompetitorDigests)
          .where(and(eq(intelCompetitorDigests.competitorId, c.id), eq(intelCompetitorDigests.weekStart, ws)))
          .limit(1))[0] ?? null
      : await getLatestDigest(c.id);
    if (!digest) {
      // No digest yet for the requested week. Generate the digest for the
      // explicitly-requested ISO week (or the prior week if none specified).
      digest = await generateWeeklyDigest(c.id, ws);
    }
    const we = new Date(digest.weekStart);
    we.setUTCDate(we.getUTCDate() + 7);
    // SQL-level week filter so high-volume competitors don't drop posts.
    const weekPosts = await db
      .select()
      .from(intelCompetitorPosts)
      .where(
        and(
          eq(intelCompetitorPosts.competitorId, c.id),
          gte(intelCompetitorPosts.publishedAt, digest.weekStart),
          lt(intelCompetitorPosts.publishedAt, we),
        ),
      )
      .orderBy(desc(intelCompetitorPosts.publishedAt));
    res.json({ competitor: c, digest, posts: weekPosts });
  });

  app.post("/api/intelligence/competitors/:id/refresh", isAuthenticated, requireIntelligencePlan, async (req, res) => {
    const uid = userId(req);
    const c = await loadCompetitor(uid, req.params.id);
    if (!c) return res.status(404).json({ error: "Not found" });
    try {
      const { ingested, sources } = await refreshCompetitor(c);
      // Manual refresh recomputes the current in-progress ISO week so the
      // user sees fresh data immediately, not last week's stale digest.
      const digest = await generateWeeklyDigest(c.id, isoWeekStart(new Date()));
      // refreshCompetitor also re-ingests Module 2 signals, so recompute the
      // "Why now?" correlations against the fresh themes/signals (best-effort).
      await correlateSignals(c.id).catch(() => {});
      res.json({ ingested, sources, digest });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Refresh failed" });
    }
  });

  // Dedicated notifications endpoint per the Module 1 spec.
  app.patch("/api/intelligence/competitors/:id/notifications", isAuthenticated, requireIntelligencePlan, async (req, res) => {
    const uid = userId(req);
    const c = await loadCompetitor(uid, req.params.id);
    if (!c) return res.status(404).json({ error: "Not found" });
    if (typeof req.body.emailDigestEnabled !== "boolean") {
      return res.status(400).json({ error: "emailDigestEnabled (boolean) is required" });
    }
    const [updated] = await db
      .update(intelCompetitors)
      .set({ emailDigestEnabled: req.body.emailDigestEnabled })
      .where(eq(intelCompetitors.id, c.id))
      .returning();
    res.json(updated);
  });

  // General PATCH for renaming + editing Module 2 signal sources (kept
  // distinct from /notifications).
  app.patch("/api/intelligence/competitors/:id", isAuthenticated, requireIntelligencePlan, async (req, res) => {
    const uid = userId(req);
    const c = await loadCompetitor(uid, req.params.id);
    if (!c) return res.status(404).json({ error: "Not found" });
    const patch: Record<string, any> = {};
    if (typeof req.body.name === "string") patch.name = req.body.name.slice(0, 160);
    if ("jobBoardUrl" in req.body) patch.jobBoardUrl = req.body.jobBoardUrl ? String(req.body.jobBoardUrl).slice(0, 500) : null;
    if ("fundingRssUrl" in req.body) patch.fundingRssUrl = req.body.fundingRssUrl ? String(req.body.fundingRssUrl).slice(0, 500) : null;
    if ("execNames" in req.body) {
      const names = Array.isArray(req.body.execNames)
        ? req.body.execNames.map((n: any) => String(n).trim()).filter(Boolean).slice(0, 5)
        : [];
      patch.execNames = names.length > 0 ? names : null;
    }
    if (Object.keys(patch).length === 0) return res.json(c);
    const [updated] = await db.update(intelCompetitors).set(patch).where(eq(intelCompetitors.id, c.id)).returning();
    res.json(updated);
  });

  // Module 2: external signals + gpt-4o correlations for a competitor.
  app.get("/api/intelligence/competitors/:id/signals", isAuthenticated, requireIntelligencePlan, async (req, res) => {
    const uid = userId(req);
    const c = await loadCompetitor(uid, req.params.id);
    if (!c) return res.status(404).json({ error: "Not found" });
    const [hiring, funding, podcasts, correlations] = await Promise.all([
      db.select().from(intelHiringSignals)
        .where(eq(intelHiringSignals.competitorId, c.id))
        .orderBy(desc(intelHiringSignals.postedAt), desc(intelHiringSignals.detectedAt)).limit(50),
      db.select().from(intelFundingSignals)
        .where(eq(intelFundingSignals.competitorId, c.id))
        .orderBy(desc(intelFundingSignals.publishedAt), desc(intelFundingSignals.detectedAt)).limit(50),
      db.select().from(intelPodcastSignals)
        .where(eq(intelPodcastSignals.competitorId, c.id))
        .orderBy(desc(intelPodcastSignals.publishedAt), desc(intelPodcastSignals.detectedAt)).limit(50),
      db.select().from(intelSignalCorrelations)
        .where(eq(intelSignalCorrelations.competitorId, c.id))
        .orderBy(desc(intelSignalCorrelations.confidence)).limit(20),
    ]);
    res.json({ competitor: c, hiring, funding, podcasts, correlations });
  });

  // Manual re-ingest of external signals + re-run of the correlation engine.
  app.post("/api/intelligence/competitors/:id/signals/refresh", isAuthenticated, requireIntelligencePlan, async (req, res) => {
    const uid = userId(req);
    const c = await loadCompetitor(uid, req.params.id);
    if (!c) return res.status(404).json({ error: "Not found" });
    try {
      const counts = await refreshSignals(c);
      const correlations = await correlateSignals(c.id);
      res.json({ counts, correlations });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Signal refresh failed" });
    }
  });

  app.delete("/api/intelligence/competitors/:id", isAuthenticated, requireIntelligencePlan, async (req, res) => {
    const uid = userId(req);
    const c = await loadCompetitor(uid, req.params.id);
    if (!c) return res.status(404).json({ error: "Not found" });
    await db.delete(intelCompetitors).where(eq(intelCompetitors.id, c.id));
    res.json({ ok: true });
  });
}
