/**
 * Weekly digest synthesis. Pulls posts for the ISO week, asks gpt-4o once
 * to extract themes + amplifiers, computes qualified engagement totals and
 * velocity vs trailing 4-week average, then upserts the digest row.
 */
import { openai } from "../lib/openai";
import { db } from "../db";
import { and, eq, gte, lt, desc, sql } from "drizzle-orm";
import {
  intelCompetitors,
  intelCompetitorPosts,
  intelCompetitorDigests,
  type IntelCompetitorPost,
  type IntelCompetitorDigest,
} from "@shared/schema";
import { qualifyEngagers } from "./qualify";

export function isoWeekStart(d: Date = new Date()): Date {
  // Monday 00:00 UTC of the ISO week containing d.
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = x.getUTCDay() || 7; // Sun=0 -> 7
  x.setUTCDate(x.getUTCDate() - (dow - 1));
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function weekEnd(weekStart: Date): Date {
  const e = new Date(weekStart);
  e.setUTCDate(e.getUTCDate() + 7);
  return e;
}

function rawEngagementOf(p: IntelCompetitorPost): number {
  return (p.rawLikes || 0) + (p.rawComments || 0) + (p.rawReposts || 0);
}

async function synthesizeThemesAndAmplifiers(posts: IntelCompetitorPost[]): Promise<{
  themes: Array<{ title: string; summary: string; postIds: string[] }>;
  amplifiers: Array<{ name: string; title?: string; reach: number }>;
}> {
  if (posts.length === 0) return { themes: [], amplifiers: [] };
  if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return { themes: [], amplifiers: [] };
  }
  const lines = posts
    .map((p, i) => `[${i + 1}] (${p.source}) ${p.author || "?"} | likes=${p.rawLikes ?? 0} reposts=${p.rawReposts ?? 0}\n${(p.title ? p.title + ": " : "")}${(p.text || "").slice(0, 400)}`)
    .join("\n\n");
  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You analyse a competitor's published content for the past week. Extract the top 3 thematic narratives they are pushing and the top 3 amplifiers (employees, executives, or partners whose posts/reposts moved the most reach). Respond with valid JSON only.",
        },
        {
          role: "user",
          content: `Here are the posts:\n\n${lines}\n\nReturn JSON: {"themes":[{"title":"...","summary":"...","postIndexes":[1,2]}, ...up to 3], "amplifiers":[{"name":"...","title":"...","reach":<number>}, ...up to 3]}.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 900,
    });
    const raw = resp.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw) as {
      themes?: Array<{ title?: string; summary?: string; postIndexes?: number[] }>;
      amplifiers?: Array<{ name?: string; title?: string; reach?: number }>;
    };
    const themes = (parsed.themes || []).slice(0, 3).map((t) => ({
      title: String(t.title || "").slice(0, 200),
      summary: String(t.summary || "").slice(0, 600),
      postIds: (t.postIndexes || [])
        .map((i) => posts[i - 1]?.id)
        .filter((x): x is string => !!x),
    }));
    const amplifiers = (parsed.amplifiers || []).slice(0, 3).map((a) => ({
      name: String(a.name || "").slice(0, 160),
      title: a.title ? String(a.title).slice(0, 160) : undefined,
      reach: typeof a.reach === "number" ? Math.max(0, Math.round(a.reach)) : 0,
    }));
    return { themes, amplifiers };
  } catch {
    return { themes: [], amplifiers: [] };
  }
}

export async function generateWeeklyDigest(competitorId: string, weekStart?: Date): Promise<IntelCompetitorDigest> {
  const ws = weekStart ? isoWeekStart(weekStart) : isoWeekStart(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const we = weekEnd(ws);

  const weekPosts = await db
    .select()
    .from(intelCompetitorPosts)
    .where(
      and(
        eq(intelCompetitorPosts.competitorId, competitorId),
        gte(intelCompetitorPosts.publishedAt, ws),
        lt(intelCompetitorPosts.publishedAt, we),
      ),
    );

  // Qualify any engagers attached to posts (best-effort; usually empty for
  // RSS, populated for X/LinkedIn when we can resolve commenters). Persist
  // both the qualified count and the qualified-flagged engagers back onto
  // the post row so the drill-down UI can show per-post breakdowns.
  let qualifiedTotal = 0;
  let rawTotal = 0;
  for (const p of weekPosts) {
    rawTotal += rawEngagementOf(p);
    const eng = (p.engagers || []) as Array<{ name: string; title?: string; company?: string }>;
    let postQualifiedCount = 0;
    let qualifiedEngagers: Array<{ name: string; title?: string; company?: string; qualified?: boolean }> = eng.map((e) => ({ ...e }));
    if (eng.length) {
      const q = await qualifyEngagers(eng);
      postQualifiedCount = q.filter((x) => x.qualified).length;
      qualifiedTotal += postQualifiedCount;
      qualifiedEngagers = q;
    }
    if (
      eng.length > 0 &&
      (p.qualifiedEngagement !== postQualifiedCount ||
        JSON.stringify(p.engagers ?? []) !== JSON.stringify(qualifiedEngagers))
    ) {
      await db
        .update(intelCompetitorPosts)
        .set({ qualifiedEngagement: postQualifiedCount, engagers: qualifiedEngagers })
        .where(eq(intelCompetitorPosts.id, p.id));
      p.qualifiedEngagement = postQualifiedCount;
      p.engagers = qualifiedEngagers;
    }
  }

  // Trailing 4-week average (the 4 weeks BEFORE this week).
  const fourWeeksBefore = new Date(ws);
  fourWeeksBefore.setUTCDate(fourWeeksBefore.getUTCDate() - 28);
  const trailing = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(intelCompetitorPosts)
    .where(
      and(
        eq(intelCompetitorPosts.competitorId, competitorId),
        gte(intelCompetitorPosts.publishedAt, fourWeeksBefore),
        lt(intelCompetitorPosts.publishedAt, ws),
      ),
    );
  const trailingCount = trailing[0]?.count ?? 0;
  const trailingAvg = trailingCount / 4;
  const velocityChangePct =
    trailingAvg > 0 ? Math.round(((weekPosts.length - trailingAvg) / trailingAvg) * 100) : weekPosts.length > 0 ? 100 : 0;

  const { themes, amplifiers } = await synthesizeThemesAndAmplifiers(weekPosts);

  // Race-safe upsert via the (competitor_id, week_start) unique index.
  const [row] = await db
    .insert(intelCompetitorDigests)
    .values({
      competitorId,
      weekStart: ws,
      themes,
      amplifiers,
      qualifiedEngagement: qualifiedTotal,
      rawEngagement: rawTotal,
      postsThisWeek: weekPosts.length,
      trailingAvgPosts: trailingAvg.toFixed(2),
      velocityChangePct,
      generatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [intelCompetitorDigests.competitorId, intelCompetitorDigests.weekStart],
      set: {
        themes,
        amplifiers,
        qualifiedEngagement: qualifiedTotal,
        rawEngagement: rawTotal,
        postsThisWeek: weekPosts.length,
        trailingAvgPosts: trailingAvg.toFixed(2),
        velocityChangePct,
        generatedAt: new Date(),
      },
    })
    .returning();
  return row;
}

export async function getLatestDigest(competitorId: string): Promise<IntelCompetitorDigest | null> {
  const [d] = await db
    .select()
    .from(intelCompetitorDigests)
    .where(eq(intelCompetitorDigests.competitorId, competitorId))
    .orderBy(desc(intelCompetitorDigests.weekStart))
    .limit(1);
  return d ?? null;
}
