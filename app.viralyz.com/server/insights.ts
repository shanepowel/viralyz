import { db } from "./db";
import { postingSlotsBaseline, contentAnalyses } from "@shared/schema";
import { and, eq, isNotNull, sql } from "drizzle-orm";

export const PLATFORMS = ["tiktok", "instagram", "youtube", "twitter", "linkedin", "threads"] as const;
export type Platform = typeof PLATFORMS[number];

export const NICHES = ["general", "fitness", "business", "tech", "lifestyle", "education"] as const;
export type Niche = typeof NICHES[number];

const PLATFORM_ALIASES: Record<string, Platform> = {
  tiktok: "tiktok",
  instagram: "instagram",
  ig: "instagram",
  reels: "instagram",
  youtube: "youtube",
  shorts: "youtube",
  twitter: "twitter",
  x: "twitter",
  linkedin: "linkedin",
  threads: "threads",
};

export function normalizePlatform(p?: string | null): Platform {
  if (!p) return "tiktok";
  return PLATFORM_ALIASES[p.toLowerCase()] ?? "tiktok";
}

export function normalizeNiche(n?: string | null): Niche {
  if (!n) return "general";
  const lower = n.toLowerCase();
  return (NICHES as readonly string[]).includes(lower) ? (lower as Niche) : "general";
}

// ============ Baseline curated by editorial research ============
// Score 1-10 (relative engagement weight). Each platform has a base curve;
// niche overlays nudge specific hours.

type Curve = (dow: number, hour: number) => number;

const baseCurve: Record<Platform, Curve> = {
  tiktok: (dow, h) => {
    let s = 3;
    if (h >= 6 && h <= 10) s = 5;
    if (h >= 11 && h <= 14) s = 7;
    if (h >= 15 && h <= 17) s = 6;
    if (h >= 19 && h <= 22) s = 9;
    if (h === 21) s = 10;
    if (dow === 0 || dow === 6) s = Math.max(2, s - 1);
    return s;
  },
  instagram: (dow, h) => {
    let s = 3;
    if (h >= 7 && h <= 9) s = 6;
    if (h >= 11 && h <= 13) s = 8;
    if (h >= 17 && h <= 20) s = 9;
    if (h === 19) s = 10;
    if (dow === 0) s = Math.max(2, s - 2);
    return s;
  },
  youtube: (dow, h) => {
    let s = 3;
    if (h >= 14 && h <= 17) s = 7;
    if (h >= 18 && h <= 21) s = 9;
    if (h === 20) s = 10;
    if (dow === 0 || dow === 6) s = Math.min(10, s + 1);
    if (h >= 0 && h <= 5) s = 2;
    return s;
  },
  twitter: (dow, h) => {
    let s = 3;
    if (h >= 7 && h <= 9) s = 8;
    if (h === 9) s = 10;
    if (h >= 11 && h <= 13) s = 7;
    if (h >= 16 && h <= 18) s = 7;
    if (dow === 0 || dow === 6) s = Math.max(2, s - 2);
    return s;
  },
  linkedin: (dow, h) => {
    let s = 2;
    if (dow >= 1 && dow <= 5) {
      if (h >= 7 && h <= 9) s = 9;
      else if (h >= 11 && h <= 13) s = 8;
      else if (h >= 16 && h <= 18) s = 7;
      else if (h >= 6 && h <= 19) s = 5;
      else s = 2;
      if (h === 8) s = 10;
    }
    return s;
  },
  threads: (dow, h) => {
    let s = 3;
    if (h >= 8 && h <= 10) s = 6;
    if (h >= 13 && h <= 15) s = 7;
    if (h >= 19 && h <= 22) s = 9;
    if (h === 20) s = 10;
    return s;
  },
};

const nicheBoost: Record<Niche, (p: Platform, dow: number, h: number) => number> = {
  general: () => 0,
  fitness: (_, dow, h) => {
    if (h >= 5 && h <= 7) return 2;
    if (h >= 17 && h <= 19) return 1;
    if ((dow === 1 || dow === 0) && h === 6) return 3;
    return 0;
  },
  business: (p, dow, h) => {
    if (p === "linkedin" || p === "twitter") {
      if (dow >= 1 && dow <= 5 && h >= 7 && h <= 9) return 1;
    }
    return 0;
  },
  tech: (_, dow, h) => {
    if (dow >= 1 && dow <= 5 && (h === 10 || h === 14)) return 1;
    return 0;
  },
  lifestyle: (_, dow, h) => {
    if ((dow === 0 || dow === 6) && h >= 9 && h <= 12) return 2;
    if (h >= 19 && h <= 21) return 1;
    return 0;
  },
  education: (_, dow, h) => {
    if (dow >= 1 && dow <= 4 && (h === 16 || h === 19 || h === 20)) return 1;
    return 0;
  },
};

export async function ensureBaselineSeeded(): Promise<void> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(postingSlotsBaseline);
  if (count > 0) return;

  const rows: { platform: Platform; niche: Niche; dow: number; hour: number; score: number }[] = [];
  for (const platform of PLATFORMS) {
    for (const niche of NICHES) {
      for (let dow = 0; dow < 7; dow++) {
        for (let hour = 0; hour < 24; hour++) {
          const base = baseCurve[platform](dow, hour);
          const boost = nicheBoost[niche](platform, dow, hour);
          const score = Math.min(10, Math.max(1, base + boost));
          rows.push({ platform, niche, dow, hour, score });
        }
      }
    }
  }
  // Insert in batches to stay under parameter limits
  const BATCH = 1000;
  for (let i = 0; i < rows.length; i += BATCH) {
    await db.insert(postingSlotsBaseline).values(rows.slice(i, i + BATCH));
  }
}

interface SlotCell {
  score: number;       // 1-10 baseline score
  multiplier: number;  // relative to platform mean (1.0 = average)
  confidence: "low" | "medium" | "high";
  personal: boolean;   // true if user actuals influenced this cell
  baseline: number;    // raw baseline 1-10
}

export interface HeatmapResult {
  platform: Platform;
  niche: Niche;
  grid: SlotCell[][]; // [dow 0-6][hour 0-23]
  top: { dow: number; hour: number; multiplier: number; score: number }[];
  source: { baselineRows: number; userPostsConsidered: number; timeZone: string };
}

/**
 * Compute a personalised heatmap. Blends baseline score with user actuals
 * for the same (platform, dow, hour) when ≥1 sample exists; weight grows
 * with sample count and saturates around 5 samples.
 */
function dowHourInTimezone(date: Date, timeZone: string): { dow: number; hour: number } {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      hour: "numeric",
      hour12: false,
    });
    const parts = fmt.formatToParts(date);
    const wd = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
    const hourStr = parts.find((p) => p.type === "hour")?.value ?? "0";
    const dows: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const hourNum = parseInt(hourStr, 10);
    return { dow: dows[wd] ?? 0, hour: (hourNum === 24 ? 0 : hourNum) % 24 };
  } catch {
    return { dow: date.getDay(), hour: date.getHours() };
  }
}

export async function computeHeatmap(
  userId: string,
  platform: Platform,
  niche: Niche,
  timeZone: string = "UTC"
): Promise<HeatmapResult> {
  const baselineRows = await db
    .select()
    .from(postingSlotsBaseline)
    .where(and(eq(postingSlotsBaseline.platform, platform), eq(postingSlotsBaseline.niche, niche)));

  // [dow][hour]
  const baseGrid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(5));
  for (const r of baselineRows) {
    baseGrid[r.dow][r.hour] = r.score;
  }

  // Fetch user's posted analyses for this platform with actuals
  const userPosts = await db
    .select({
      postedAt: contentAnalyses.postedAt,
      actualViews: contentAnalyses.actualViews,
      actualLikes: contentAnalyses.actualLikes,
    })
    .from(contentAnalyses)
    .where(
      and(
        eq(contentAnalyses.userId, userId),
        eq(contentAnalyses.targetPlatform, platform),
        isNotNull(contentAnalyses.postedAt)
      )
    );

  // Aggregate engagement by (dow, hour)
  const sumByCell: Map<string, { sum: number; n: number }> = new Map();
  let postsConsidered = 0;
  let globalSum = 0;
  let globalN = 0;
  for (const p of userPosts) {
    if (!p.postedAt) continue;
    const eng = (p.actualViews ?? 0) + (p.actualLikes ?? 0) * 5;
    if (eng <= 0) continue;
    const d = new Date(p.postedAt);
    const { dow: pdow, hour: phour } = dowHourInTimezone(d, timeZone);
    const key = `${pdow}-${phour}`;
    const entry = sumByCell.get(key) ?? { sum: 0, n: 0 };
    entry.sum += eng;
    entry.n += 1;
    sumByCell.set(key, entry);
    globalSum += eng;
    globalN += 1;
    postsConsidered += 1;
  }
  const userMean = globalN > 0 ? globalSum / globalN : 0;

  // Build personal score per cell as relative-to-mean (mapped 1-10)
  const grid: SlotCell[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => ({
      score: 0,
      multiplier: 1,
      confidence: "low" as const,
      personal: false,
      baseline: 0,
    }))
  );
  for (let dow = 0; dow < 7; dow++) {
    for (let hour = 0; hour < 24; hour++) {
      const base = baseGrid[dow][hour];
      const cellAgg = sumByCell.get(`${dow}-${hour}`);
      let blended = base;
      let personal = false;
      if (cellAgg && userMean > 0 && postsConsidered >= 5) {
        const ratio = (cellAgg.sum / cellAgg.n) / userMean; // 1.0 = average for this user
        const personalScore = Math.max(1, Math.min(10, ratio * 5));
        // Weight: saturates near n=5
        const w = cellAgg.n / (cellAgg.n + 4);
        blended = base * (1 - w) + personalScore * w;
        personal = true;
      }
      grid[dow][hour] = {
        score: Math.round(blended * 10) / 10,
        multiplier: 1, // filled below
        confidence: postsConsidered >= 10 ? "high" : postsConsidered >= 3 ? "medium" : "low",
        personal,
        baseline: base,
      };
    }
  }

  // Compute multiplier = score / mean(score across grid)
  let total = 0;
  let n = 0;
  for (let d = 0; d < 7; d++) for (let h = 0; h < 24; h++) { total += grid[d][h].score; n++; }
  const mean = total / n;
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      grid[d][h].multiplier = Math.round((grid[d][h].score / mean) * 100) / 100;
    }
  }

  // Top 3 slots
  const flat: { dow: number; hour: number; multiplier: number; score: number }[] = [];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      flat.push({ dow: d, hour: h, multiplier: grid[d][h].multiplier, score: grid[d][h].score });
    }
  }
  flat.sort((a, b) => b.multiplier - a.multiplier);
  const top = flat.slice(0, 3);

  return {
    platform,
    niche,
    grid,
    top,
    source: { baselineRows: baselineRows.length, userPostsConsidered: postsConsidered, timeZone },
  };
}

export function multiplierForSlot(grid: SlotCell[][], dow: number, hour: number): number {
  if (!grid[dow] || !grid[dow][hour]) return 1;
  return grid[dow][hour].multiplier;
}
