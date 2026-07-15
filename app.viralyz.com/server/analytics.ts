import { db } from "./db";
import { contentAnalyses, userModels } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { computeHeatmap, normalizePlatform } from "./insights";

export async function getAnalyticsDashboard(userId: string, platform = "tiktok") {
  const analyses = await db
    .select()
    .from(contentAnalyses)
    .where(eq(contentAnalyses.userId, userId))
    .orderBy(desc(contentAnalyses.createdAt));

  const totalAnalyses = analyses.length;
  const avgScore =
    totalAnalyses === 0
      ? 0
      : Math.round(
          analyses.reduce((sum, row) => sum + (row.viralScore || 0), 0) /
            totalAnalyses,
        );

  const withActuals = analyses.filter((row) => (row.actualViews ?? 0) > 0);
  const totalViews = withActuals.reduce(
    (sum, row) => sum + (row.actualViews || 0),
    0,
  );

  let predictionAccuracy = 0;
  const [model] = await db
    .select()
    .from(userModels)
    .where(eq(userModels.userId, userId))
    .limit(1);

  if (model?.predictionAccuracy) {
    predictionAccuracy = Math.round(Number(model.predictionAccuracy) * 100);
  } else if (withActuals.length > 0) {
    const deltas = withActuals
      .filter((row) => row.viralScore && row.actualViews)
      .map((row) => Math.min(100, Math.round((row.actualViews || 0) / 1000)));
    predictionAccuracy =
      deltas.length === 0
        ? 0
        : Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length);
  }

  const recent = analyses.slice(0, 30);
  const midpoint = Math.floor(recent.length / 2);
  const recentHalf = recent.slice(0, midpoint);
  const olderHalf = recent.slice(midpoint);
  const recentAvg =
    recentHalf.length === 0
      ? 0
      : recentHalf.reduce((sum, row) => sum + (row.viralScore || 0), 0) /
        recentHalf.length;
  const olderAvg =
    olderHalf.length === 0
      ? recentAvg
      : olderHalf.reduce((sum, row) => sum + (row.viralScore || 0), 0) /
        olderHalf.length;
  const improvement = Math.round(recentAvg - olderAvg);

  const scoreTrend = [...analyses]
    .reverse()
    .slice(-14)
    .map((row) => ({
      date: row.createdAt?.toISOString().slice(0, 10) ?? "",
      score: row.viralScore || 0,
    }));

  const heatmap = await computeHeatmap(
    userId,
    normalizePlatform(platform),
    "general",
    "UTC",
  );

  const heatmapCells = heatmap.grid.flatMap((row, dow) =>
    row.map((cell, hour) => ({
      dow,
      hour,
      score: cell.score,
    })),
  );

  return {
    stats: {
      totalAnalyses,
      avgScore,
      totalViews,
      predictionAccuracy,
      improvement,
    },
    scoreTrend,
    heatmap: { cells: heatmapCells, top: heatmap.top },
  };
}
