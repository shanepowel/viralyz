import { db } from "./db";
import {
  notifications,
  brandVoiceProfiles,
  thumbnails,
  contentAnalyses,
  hookGenerations,
  captionDrafts,
  contentIdeas,
  swipePosts,
  userSwipeSaves,
  repurposeRuns,
  repurposeVariants,
  users,
  type Notification,
  type InsertNotification,
  type BrandVoiceProfile,
  type InsertBrandVoiceProfile,
  type Thumbnail,
  type InsertThumbnail,
  type SwipePost,
  type InsertSwipePost,
  type RepurposeRun,
  type RepurposeVariant,
  type LintFlag,
} from "@shared/schema";
import { and, desc, eq, gte, ilike, inArray, isNull, lte, or, sql } from "drizzle-orm";

// ============== Notifications ==============
export async function createNotification(data: InsertNotification): Promise<Notification> {
  const [row] = await db.insert(notifications).values(data).returning();
  return row;
}

export async function listNotifications(userId: string, limit = 30): Promise<Notification[]> {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function unreadNotificationCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return Number(row?.count || 0);
}

export async function markNotificationRead(id: string, userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
}

// ============== Brand Voice ==============
export async function listBrandVoiceProfiles(userId: string): Promise<BrandVoiceProfile[]> {
  return db
    .select()
    .from(brandVoiceProfiles)
    .where(eq(brandVoiceProfiles.userId, userId))
    .orderBy(desc(brandVoiceProfiles.isDefault), desc(brandVoiceProfiles.createdAt));
}

export async function getBrandVoiceProfile(id: string, userId: string): Promise<BrandVoiceProfile | undefined> {
  const [row] = await db
    .select()
    .from(brandVoiceProfiles)
    .where(and(eq(brandVoiceProfiles.id, id), eq(brandVoiceProfiles.userId, userId)));
  return row;
}

export async function getDefaultBrandVoice(userId: string): Promise<BrandVoiceProfile | undefined> {
  const [row] = await db
    .select()
    .from(brandVoiceProfiles)
    .where(and(eq(brandVoiceProfiles.userId, userId), eq(brandVoiceProfiles.isDefault, true)));
  return row;
}

export async function createBrandVoiceProfile(data: InsertBrandVoiceProfile): Promise<BrandVoiceProfile> {
  if (data.isDefault) {
    await db
      .update(brandVoiceProfiles)
      .set({ isDefault: false })
      .where(eq(brandVoiceProfiles.userId, data.userId));
  }
  const [row] = await db.insert(brandVoiceProfiles).values(data).returning();
  return row;
}

export async function updateBrandVoiceProfile(
  id: string,
  userId: string,
  patch: Partial<InsertBrandVoiceProfile>
): Promise<BrandVoiceProfile | undefined> {
  if (patch.isDefault) {
    await db
      .update(brandVoiceProfiles)
      .set({ isDefault: false })
      .where(eq(brandVoiceProfiles.userId, userId));
  }
  const [row] = await db
    .update(brandVoiceProfiles)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(brandVoiceProfiles.id, id), eq(brandVoiceProfiles.userId, userId)))
    .returning();
  return row;
}

export async function deleteBrandVoiceProfile(id: string, userId: string): Promise<void> {
  await db
    .delete(brandVoiceProfiles)
    .where(and(eq(brandVoiceProfiles.id, id), eq(brandVoiceProfiles.userId, userId)));
}

// ============== Thumbnails ==============
export async function listThumbnails(userId: string, limit = 40): Promise<Thumbnail[]> {
  return db
    .select()
    .from(thumbnails)
    .where(eq(thumbnails.userId, userId))
    .orderBy(desc(thumbnails.createdAt))
    .limit(limit);
}

export async function createThumbnail(data: InsertThumbnail): Promise<Thumbnail> {
  const [row] = await db.insert(thumbnails).values(data).returning();
  return row;
}

export async function deleteThumbnail(id: string, userId: string): Promise<void> {
  await db.delete(thumbnails).where(and(eq(thumbnails.id, id), eq(thumbnails.userId, userId)));
}

// ============== Schedule / Calendar ==============
export async function getScheduledAnalyses(userId: string, fromIso: string, toIso: string) {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  return db
    .select()
    .from(contentAnalyses)
    .where(
      and(
        eq(contentAnalyses.userId, userId),
        gte(contentAnalyses.scheduledFor, from),
        lte(contentAnalyses.scheduledFor, to)
      )
    )
    .orderBy(contentAnalyses.scheduledFor);
}

export async function setAnalysisSchedule(
  id: string,
  userId: string,
  scheduledFor: Date | null
) {
  const [row] = await db
    .update(contentAnalyses)
    .set({
      scheduledFor,
      status: scheduledFor ? "scheduled" : "draft",
      updatedAt: new Date(),
    })
    .where(and(eq(contentAnalyses.id, id), eq(contentAnalyses.userId, userId)))
    .returning();
  return row;
}

export async function recordAnalysisActuals(
  id: string,
  userId: string,
  actuals: { views?: number; likes?: number; comments?: number; shares?: number; postedAt?: Date }
) {
  const patch: Record<string, unknown> = {
    postedAt: actuals.postedAt ?? new Date(),
    status: "posted",
    scheduledFor: null,
    updatedAt: new Date(),
  };
  if (actuals.views !== undefined) patch.actualViews = actuals.views;
  if (actuals.likes !== undefined) patch.actualLikes = actuals.likes;
  if (actuals.comments !== undefined) patch.actualComments = actuals.comments;
  if (actuals.shares !== undefined) patch.actualShares = actuals.shares;
  const [row] = await db
    .update(contentAnalyses)
    .set(patch)
    .where(and(eq(contentAnalyses.id, id), eq(contentAnalyses.userId, userId)))
    .returning();
  return row;
}

// ============== Pipeline / Board ==============
export const BOARD_STATUSES = ["idea", "draft", "ready", "scheduled", "posted"] as const;
export type BoardStatus = (typeof BOARD_STATUSES)[number];

export function normalizeBoardStatus(status: string | null | undefined): BoardStatus {
  const s = (status || "").toLowerCase();
  if (s === "idea") return "idea";
  if (s === "draft") return "draft";
  if (s === "analyzed") return "ready"; // legacy: analyzed rows graduate to Ready
  if (s === "ready") return "ready";
  if (s === "scheduled") return "scheduled";
  if (s === "posted") return "posted";
  return "draft";
}

export async function setAnalysisStatus(
  id: string,
  userId: string,
  status: BoardStatus
) {
  const patch: Record<string, unknown> = { status, updatedAt: new Date() };
  if (status !== "scheduled") {
    patch.scheduledFor = null;
  }
  if (status !== "posted") {
    patch.postedAt = null;
  }
  const [row] = await db
    .update(contentAnalyses)
    .set(patch)
    .where(and(eq(contentAnalyses.id, id), eq(contentAnalyses.userId, userId)))
    .returning();
  return row;
}

export async function getBoardItems(
  userId: string,
  filters: { platform?: string; niche?: string; q?: string } = {}
) {
  const wheres = [eq(contentAnalyses.userId, userId)];
  if (filters.platform && filters.platform !== "all") {
    wheres.push(eq(contentAnalyses.targetPlatform, filters.platform.toLowerCase()));
  }
  if (filters.niche && filters.niche !== "all") {
    const nicheNeedle = `%${filters.niche.replace(/[%_]/g, "\\$&")}%`;
    wheres.push(
      or(ilike(contentAnalyses.title, nicheNeedle), ilike(contentAnalyses.description, nicheNeedle))!
    );
  }
  if (filters.q && filters.q.trim()) {
    const needle = `%${filters.q.replace(/[%_]/g, "\\$&")}%`;
    wheres.push(or(ilike(contentAnalyses.title, needle), ilike(contentAnalyses.description, needle))!);
  }
  // Trimmed card payload — exclude heavy JSON blobs (analysisResults, suggestions).
  const rows = await db
    .select({
      id: contentAnalyses.id,
      title: contentAnalyses.title,
      thumbnailUrl: contentAnalyses.thumbnailUrl,
      targetPlatform: contentAnalyses.targetPlatform,
      contentType: contentAnalyses.contentType,
      viralScore: contentAnalyses.viralScore,
      status: contentAnalyses.status,
      scheduledFor: contentAnalyses.scheduledFor,
      postedAt: contentAnalyses.postedAt,
      actualViews: contentAnalyses.actualViews,
      actualLikes: contentAnalyses.actualLikes,
      actualComments: contentAnalyses.actualComments,
      actualShares: contentAnalyses.actualShares,
      createdAt: contentAnalyses.createdAt,
      updatedAt: contentAnalyses.updatedAt,
    })
    .from(contentAnalyses)
    .where(and(...wheres))
    .orderBy(desc(contentAnalyses.updatedAt));

  const counts: Record<BoardStatus, number> = { idea: 0, draft: 0, ready: 0, scheduled: 0, posted: 0 };
  const items = rows.map((r) => {
    const col = normalizeBoardStatus(r.status);
    counts[col] += 1;
    return { ...r, boardStatus: col };
  });
  return { items, counts };
}

// ============== Global Search ==============
export async function globalSearch(userId: string, q: string) {
  const needle = `%${q.replace(/[%_]/g, "\\$&")}%`;

  const [analyses, hooks, captions, ideas] = await Promise.all([
    db
      .select({
        id: contentAnalyses.id,
        title: contentAnalyses.title,
        viralScore: contentAnalyses.viralScore,
        platform: contentAnalyses.targetPlatform,
        createdAt: contentAnalyses.createdAt,
      })
      .from(contentAnalyses)
      .where(
        and(
          eq(contentAnalyses.userId, userId),
          or(ilike(contentAnalyses.title, needle), ilike(contentAnalyses.description, needle))
        )
      )
      .orderBy(desc(contentAnalyses.createdAt))
      .limit(10),
    db
      .select({
        id: hookGenerations.id,
        topic: hookGenerations.topic,
        platform: hookGenerations.platform,
        createdAt: hookGenerations.createdAt,
      })
      .from(hookGenerations)
      .where(and(eq(hookGenerations.userId, userId), ilike(hookGenerations.topic, needle)))
      .orderBy(desc(hookGenerations.createdAt))
      .limit(10),
    db
      .select({
        id: captionDrafts.id,
        original: captionDrafts.originalCaption,
        platform: captionDrafts.platform,
        viralScore: captionDrafts.viralScore,
        createdAt: captionDrafts.createdAt,
      })
      .from(captionDrafts)
      .where(and(eq(captionDrafts.userId, userId), ilike(captionDrafts.originalCaption, needle)))
      .orderBy(desc(captionDrafts.createdAt))
      .limit(10),
    db
      .select({
        id: contentIdeas.id,
        title: contentIdeas.title,
        platform: contentIdeas.platform,
        predictedScore: contentIdeas.predictedScore,
        saved: contentIdeas.saved,
        createdAt: contentIdeas.createdAt,
      })
      .from(contentIdeas)
      .where(and(eq(contentIdeas.userId, userId), ilike(contentIdeas.title, needle)))
      .orderBy(desc(contentIdeas.createdAt))
      .limit(10),
  ]);

  return { analyses, hooks, captions, ideas };
}

// ============== Swipe File ==============
export interface SwipeListFilters {
  platform?: string;
  niche?: string;
  hookType?: string;
  format?: string;
  q?: string;
  minScore?: number;
  sort?: "score" | "newest" | "trending";
  limit?: number;
  savedOnly?: boolean;
  userId?: string;
}

export async function listSwipePosts(filters: SwipeListFilters = {}): Promise<
  Array<SwipePost & { saved?: boolean }>
> {
  const conds = [] as any[];
  if (filters.platform && filters.platform !== "all") conds.push(eq(swipePosts.platform, filters.platform));
  if (filters.niche && filters.niche !== "all") conds.push(eq(swipePosts.niche, filters.niche));
  if (filters.hookType && filters.hookType !== "all") conds.push(eq(swipePosts.hookType, filters.hookType));
  if (filters.format && filters.format !== "all") conds.push(eq(swipePosts.format, filters.format));
  if (filters.minScore) conds.push(gte(swipePosts.viralScore, filters.minScore));
  if (filters.q && filters.q.trim().length >= 2) {
    const needle = `%${filters.q.trim()}%`;
    conds.push(or(ilike(swipePosts.text, needle), ilike(swipePosts.whyItWorks, needle)));
  }

  if (filters.sort === "trending") {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    conds.push(gte(swipePosts.createdAt, weekAgo));
  }
  const orderBy =
    filters.sort === "newest"
      ? desc(swipePosts.createdAt)
      : desc(swipePosts.viralScore);

  const rows = await db
    .select()
    .from(swipePosts)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(orderBy)
    .limit(filters.limit ?? 60);

  if (!filters.userId) return rows.map((r) => ({ ...r, saved: false }));

  const saves = await db
    .select({ swipeId: userSwipeSaves.swipeId })
    .from(userSwipeSaves)
    .where(
      and(
        eq(userSwipeSaves.userId, filters.userId),
        rows.length ? inArray(userSwipeSaves.swipeId, rows.map((r) => r.id)) : sql`false`
      )
    );
  const savedSet = new Set(saves.map((s) => s.swipeId));
  const annotated = rows.map((r) => ({ ...r, saved: savedSet.has(r.id) }));
  if (filters.savedOnly) return annotated.filter((r) => r.saved);
  return annotated;
}

export async function getSwipePost(id: string, userId?: string) {
  const [row] = await db.select().from(swipePosts).where(eq(swipePosts.id, id));
  if (!row) return null;
  let saved = false;
  if (userId) {
    const [s] = await db
      .select()
      .from(userSwipeSaves)
      .where(and(eq(userSwipeSaves.userId, userId), eq(userSwipeSaves.swipeId, id)));
    saved = !!s;
  }
  return { ...row, saved };
}

export async function listSavedSwipes(userId: string) {
  const rows = await db
    .select({ swipe: swipePosts })
    .from(userSwipeSaves)
    .innerJoin(swipePosts, eq(swipePosts.id, userSwipeSaves.swipeId))
    .where(eq(userSwipeSaves.userId, userId))
    .orderBy(desc(userSwipeSaves.createdAt));
  return rows.map((r) => ({ ...r.swipe, saved: true }));
}

export async function saveSwipe(userId: string, swipeId: string) {
  const [existing] = await db
    .select()
    .from(userSwipeSaves)
    .where(and(eq(userSwipeSaves.userId, userId), eq(userSwipeSaves.swipeId, swipeId)));
  if (existing) return existing;
  const [row] = await db.insert(userSwipeSaves).values({ userId, swipeId }).returning();
  return row;
}

export async function unsaveSwipe(userId: string, swipeId: string) {
  await db
    .delete(userSwipeSaves)
    .where(and(eq(userSwipeSaves.userId, userId), eq(userSwipeSaves.swipeId, swipeId)));
}

export async function createSwipePost(data: InsertSwipePost): Promise<SwipePost> {
  const [row] = await db.insert(swipePosts).values(data).returning();
  return row;
}

export async function bulkInsertSwipePosts(data: InsertSwipePost[]): Promise<number> {
  if (!data.length) return 0;
  const inserted = await db.insert(swipePosts).values(data).returning({ id: swipePosts.id });
  return inserted.length;
}

export async function countSwipePosts(): Promise<number> {
  const [row] = await db.select({ count: sql<number>`count(*)` }).from(swipePosts);
  return Number(row?.count || 0);
}

export async function listSwipeFacets(): Promise<{
  platforms: string[];
  niches: string[];
  hookTypes: string[];
  formats: string[];
}> {
  const rows = await db
    .select({
      platform: swipePosts.platform,
      niche: swipePosts.niche,
      hookType: swipePosts.hookType,
      format: swipePosts.format,
    })
    .from(swipePosts);
  const uniq = (a: (string | null)[]) =>
    Array.from(new Set(a.filter((x): x is string => !!x))).sort();
  return {
    platforms: uniq(rows.map((r) => r.platform)),
    niches: uniq(rows.map((r) => r.niche)),
    hookTypes: uniq(rows.map((r) => r.hookType)),
    formats: uniq(rows.map((r) => r.format)),
  };
}

// ============== Cross-platform Repurposer ==============
export interface NewVariantInput {
  platform: string;
  text: string;
  hashtags: string[];
  viralScore: number;
  scoreBreakdown: { hook: number; visual: number; structure: number; metadata: number; timing: number };
  platformNote: string;
  lintFlags: LintFlag[];
}

export async function createRepurposeRun(
  userId: string,
  sourceText: string,
  variants: NewVariantInput[],
  opts: { brandVoiceUsed: boolean; sourceAnalysisId?: string | null }
): Promise<{ run: RepurposeRun; variants: RepurposeVariant[] }> {
  const [run] = await db
    .insert(repurposeRuns)
    .values({
      userId,
      sourceText,
      sourceAnalysisId: opts.sourceAnalysisId ?? null,
      brandVoiceUsed: opts.brandVoiceUsed,
    })
    .returning();

  if (!variants.length) return { run, variants: [] };

  const rows = await db
    .insert(repurposeVariants)
    .values(
      variants.map((v) => ({
        runId: run.id,
        platform: v.platform,
        text: v.text,
        hashtags: v.hashtags,
        viralScore: v.viralScore,
        scoreBreakdown: v.scoreBreakdown,
        platformNote: v.platformNote,
        lintFlags: v.lintFlags,
        status: "ready",
      }))
    )
    .returning();

  return { run, variants: rows };
}

export async function listRepurposeRuns(userId: string, limit = 20): Promise<
  Array<RepurposeRun & { variants: RepurposeVariant[] }>
> {
  const runs = await db
    .select()
    .from(repurposeRuns)
    .where(eq(repurposeRuns.userId, userId))
    .orderBy(desc(repurposeRuns.createdAt))
    .limit(limit);

  if (!runs.length) return [];

  const variants = await db
    .select()
    .from(repurposeVariants)
    .where(inArray(repurposeVariants.runId, runs.map((r) => r.id)))
    .orderBy(desc(repurposeVariants.viralScore));

  const byRun = new Map<string, RepurposeVariant[]>();
  for (const v of variants) {
    if (!byRun.has(v.runId)) byRun.set(v.runId, []);
    byRun.get(v.runId)!.push(v);
  }

  return runs.map((r) => ({ ...r, variants: byRun.get(r.id) ?? [] }));
}

export async function getRepurposeVariant(
  variantId: string,
  userId: string
): Promise<{ variant: RepurposeVariant; run: RepurposeRun } | null> {
  const [row] = await db
    .select({ variant: repurposeVariants, run: repurposeRuns })
    .from(repurposeVariants)
    .innerJoin(repurposeRuns, eq(repurposeRuns.id, repurposeVariants.runId))
    .where(and(eq(repurposeVariants.id, variantId), eq(repurposeRuns.userId, userId)));
  return row ?? null;
}

export async function saveRepurposeVariantAsDraft(
  variantId: string,
  userId: string
): Promise<{ analysis: typeof contentAnalyses.$inferSelect; variant: RepurposeVariant } | null> {
  const found = await getRepurposeVariant(variantId, userId);
  if (!found) return null;
  const { variant } = found;

  const title = variant.text.split(/\n/)[0].slice(0, 100) || "Repurposed draft";

  const [analysis] = await db
    .insert(contentAnalyses)
    .values({
      userId,
      title,
      description: variant.text,
      targetPlatform: variant.platform,
      contentType: "post",
      viralScore: variant.viralScore ?? null,
      hookScore: variant.scoreBreakdown?.hook ?? null,
      visualScore: variant.scoreBreakdown?.visual ?? null,
      structureScore: variant.scoreBreakdown?.structure ?? null,
      metadataScore: variant.scoreBreakdown?.metadata ?? null,
      timingScore: variant.scoreBreakdown?.timing ?? null,
      analysisResults: { hashtags: variant.hashtags ?? [], platformNote: variant.platformNote ?? "" },
      suggestions: variant.lintFlags ?? null,
      status: "draft",
    })
    .returning();

  const [updatedVariant] = await db
    .update(repurposeVariants)
    .set({ status: "draft", scheduledAnalysisId: analysis.id })
    .where(eq(repurposeVariants.id, variantId))
    .returning();

  return { analysis, variant: updatedVariant };
}

export async function scheduleRepurposeVariant(
  variantId: string,
  userId: string,
  scheduledFor: Date
): Promise<{ analysis: typeof contentAnalyses.$inferSelect; variant: RepurposeVariant } | null> {
  const found = await getRepurposeVariant(variantId, userId);
  if (!found) return null;
  const { variant } = found;

  const title = variant.text.split(/\n/)[0].slice(0, 100) || "Repurposed post";

  const [analysis] = await db
    .insert(contentAnalyses)
    .values({
      userId,
      title,
      description: variant.text,
      targetPlatform: variant.platform,
      contentType: "post",
      viralScore: variant.viralScore ?? null,
      hookScore: variant.scoreBreakdown?.hook ?? null,
      visualScore: variant.scoreBreakdown?.visual ?? null,
      structureScore: variant.scoreBreakdown?.structure ?? null,
      metadataScore: variant.scoreBreakdown?.metadata ?? null,
      timingScore: variant.scoreBreakdown?.timing ?? null,
      analysisResults: { hashtags: variant.hashtags ?? [], platformNote: variant.platformNote ?? "" },
      suggestions: variant.lintFlags ?? null,
      status: "scheduled",
      scheduledFor,
    })
    .returning();

  const [updatedVariant] = await db
    .update(repurposeVariants)
    .set({ status: "scheduled", scheduledAnalysisId: analysis.id })
    .where(eq(repurposeVariants.id, variantId))
    .returning();

  return { analysis, variant: updatedVariant };
}

// ============== Weekly Digest ==============
export type WeeklyDigestPayload = {
  analysisCount: number;
  averageScore: number | null;
  topAnalysis?: {
    id: string;
    title: string | null;
    viralScore: number | null;
    platform: string | null;
  };
  upcomingPosts: Array<{
    id: string;
    title: string | null;
    scheduledFor: Date;
    platform: string | null;
  }>;
  accuracy: { sampleSize: number; meanAbsoluteError: number | null };
};

export async function getWeeklyDigestPayload(userId: string, now = new Date()): Promise<WeeklyDigestPayload> {
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const weekAhead = new Date(now.getTime() + 7 * 86400000);

  const recent = await db
    .select({
      id: contentAnalyses.id,
      title: contentAnalyses.title,
      viralScore: contentAnalyses.viralScore,
      platform: contentAnalyses.targetPlatform,
    })
    .from(contentAnalyses)
    .where(and(eq(contentAnalyses.userId, userId), gte(contentAnalyses.createdAt, weekAgo)))
    .orderBy(desc(contentAnalyses.viralScore));

  const scored = recent.filter((r) => typeof r.viralScore === "number");
  const averageScore = scored.length
    ? scored.reduce((s, r) => s + (r.viralScore as number), 0) / scored.length
    : null;
  const topAnalysis = scored[0]
    ? {
        id: scored[0].id,
        title: scored[0].title,
        viralScore: scored[0].viralScore,
        platform: scored[0].platform,
      }
    : undefined;

  const upcoming = await db
    .select({
      id: contentAnalyses.id,
      title: contentAnalyses.title,
      scheduledFor: contentAnalyses.scheduledFor,
      platform: contentAnalyses.targetPlatform,
    })
    .from(contentAnalyses)
    .where(
      and(
        eq(contentAnalyses.userId, userId),
        gte(contentAnalyses.scheduledFor, now),
        lte(contentAnalyses.scheduledFor, weekAhead),
      ),
    )
    .orderBy(contentAnalyses.scheduledFor)
    .limit(5);

  const upcomingPosts = upcoming
    .filter((u): u is typeof u & { scheduledFor: Date } => u.scheduledFor instanceof Date)
    .map((u) => ({ id: u.id, title: u.title, scheduledFor: u.scheduledFor, platform: u.platform }));

  const posted = await db
    .select({
      viralScore: contentAnalyses.viralScore,
      actualViews: contentAnalyses.actualViews,
    })
    .from(contentAnalyses)
    .where(
      and(
        eq(contentAnalyses.userId, userId),
        eq(contentAnalyses.status, "posted"),
        gte(contentAnalyses.postedAt, weekAgo),
      ),
    );

  const errors: number[] = [];
  for (const p of posted) {
    if (p.viralScore == null || p.actualViews == null) continue;
    const actualNorm = Math.min(100, Math.round((p.actualViews / 10000) * 100));
    errors.push(Math.abs((p.viralScore as number) - actualNorm));
  }
  const meanAbsoluteError = errors.length ? errors.reduce((a, b) => a + b, 0) / errors.length : null;

  return {
    analysisCount: recent.length,
    averageScore,
    topAnalysis,
    upcomingPosts,
    accuracy: { sampleSize: errors.length, meanAbsoluteError },
  };
}

export async function listUsersForWeeklyDigest(now = new Date(), staleAfterMs = 7 * 86400000) {
  const cutoff = new Date(now.getTime() - staleAfterMs);
  return db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastDigestSentAt: users.lastDigestSentAt,
    })
    .from(users)
    .where(
      and(
        eq(users.emailDigests, true),
        eq(users.onboardingCompleted, true),
        or(isNull(users.lastDigestSentAt), lte(users.lastDigestSentAt, cutoff)),
      ),
    );
}

export async function markDigestSent(userId: string, sentAt = new Date()): Promise<void> {
  await db.update(users).set({ lastDigestSentAt: sentAt }).where(eq(users.id, userId));
}

export async function setEmailDigestsEnabled(userId: string, enabled: boolean): Promise<void> {
  await db
    .update(users)
    .set({ emailDigests: enabled, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

// ============== Onboarding ==============
export async function setOnboarding(
  userId: string,
  data: { primaryPlatform?: string; primaryNiche?: string; goal?: string; completed?: boolean }
) {
  await db
    .update(users)
    .set({
      primaryPlatform: data.primaryPlatform ?? null,
      primaryNiche: data.primaryNiche ?? null,
      goal: data.goal ?? null,
      onboardingCompleted: data.completed ?? true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}
