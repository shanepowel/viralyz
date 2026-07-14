import { db } from "./db";
import { contentAnalyses, analysisHistory, users } from "@shared/schema";
import { eq, desc, count } from "drizzle-orm";
import {
  buildScoreDiff,
  PIPELINE_STAGES,
  type AnalysisResultV2,
  type FixSuggestion,
  type ScoreDiff,
  type StageListener,
} from "@repo/score-engine";
import {
  runMediaAnalysisPipeline,
  scoreWithMedia,
  type MediaContext,
} from "./analysis-pipeline";

/** @deprecated Prefer AnalysisResultV2 */
export type AnalysisResult = AnalysisResultV2;

/** Text-only / autopilot-compatible scorer */
export async function analyzeContent(
  title: string,
  description: string,
  platform: string,
  contentType: string,
  opts?: { historyCount?: number; hasMedia?: boolean; fileUrl?: string | null },
): Promise<AnalysisResultV2> {
  if (opts?.fileUrl) {
    const { result } = await runMediaAnalysisPipeline({
      title,
      description,
      platform,
      contentType,
      fileUrl: opts.fileUrl,
      historyCount: opts.historyCount,
      persist: async () => {},
    });
    return result;
  }

  return scoreWithMedia({
    title,
    description,
    platform,
    contentType,
    historyCount: opts?.historyCount,
    media: {
      fileUrl: null,
      frames: [],
      transcript: null,
      durationSeconds: null,
    },
  });
}

export async function analyzeWithPipeline(
  input: {
    title: string;
    description: string;
    platform: string;
    contentType: string;
    hasMedia?: boolean;
    historyCount?: number;
    fileUrl?: string | null;
  },
  onStage?: StageListener,
  persist?: (result: AnalysisResultV2, media: MediaContext) => Promise<void>,
): Promise<AnalysisResultV2> {
  const { result } = await runMediaAnalysisPipeline({
    title: input.title,
    description: input.description,
    platform: input.platform,
    contentType: input.contentType,
    fileUrl: input.fileUrl,
    historyCount: input.historyCount,
    onStage,
    persist: persist ?? (async () => {}),
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
  media?: {
    fileUrl?: string | null;
    thumbnailUrl?: string | null;
    durationSeconds?: number | null;
  },
) {
  const [analysis] = await db
    .insert(contentAnalyses)
    .values({
      userId,
      title,
      description,
      targetPlatform: platform,
      contentType,
      fileUrl: media?.fileUrl || null,
      thumbnailUrl: media?.thumbnailUrl || null,
      durationSeconds: media?.durationSeconds
        ? Math.round(media.durationSeconds)
        : null,
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
    fileUrl?: string | null;
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
  const platform = updates.platform ?? existing.targetPlatform ?? "youtube";
  const contentType = updates.contentType ?? existing.contentType ?? "video";
  const fileUrl = updates.fileUrl ?? existing.fileUrl;

  await db.insert(analysisHistory).values({
    contentId: existing.id,
    viralScore: existing.viralScore,
    analysisResults: existing.analysisResults,
    suggestions: existing.suggestions,
  });

  const historyCount = await countAnalysesForUser(userId);
  let savedMedia: MediaContext | undefined;

  const result = await analyzeWithPipeline(
    {
      title,
      description,
      platform,
      contentType,
      fileUrl,
      hasMedia: !!fileUrl,
      historyCount,
    },
    onStage,
    async (_result, media) => {
      savedMedia = media;
    },
  );

  const [updated] = await db
    .update(contentAnalyses)
    .set({
      title,
      description,
      targetPlatform: platform,
      contentType,
      fileUrl: fileUrl || existing.fileUrl,
      thumbnailUrl: savedMedia?.thumbnailDataUrl
        ? existing.thumbnailUrl
        : existing.thumbnailUrl,
      durationSeconds:
        savedMedia?.durationSeconds != null
          ? Math.round(savedMedia.durationSeconds)
          : existing.durationSeconds,
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
      ? (updates.appliedFixIndexes
          .map((i) => prevResults.top3Fixes?.[i])
          .filter(Boolean) as FixSuggestion[])
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

  return db
    .select()
    .from(analysisHistory)
    .where(eq(analysisHistory.contentId, analysisId))
    .orderBy(desc(analysisHistory.analyzedAt));
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
