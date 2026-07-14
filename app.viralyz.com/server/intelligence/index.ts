/**
 * Public surface of the intelligence module: refresh competitor sources,
 * regenerate the weekly digest. Source adapters are best-effort and
 * degrade silently per the architectural constraint.
 */
import { db } from "../db";
import { and, eq } from "drizzle-orm";
import {
  intelCompetitors,
  intelCompetitorPosts,
  intelHiringSignals,
  intelFundingSignals,
  intelPodcastSignals,
  type IntelCompetitor,
} from "@shared/schema";
import { fetchRss, type RawPost } from "./rss";
import { fetchXTimeline } from "./x-public";
import { fetchLinkedInCompanyPosts } from "./linkedin-company";
import { generateWeeklyDigest } from "./digest";
import { fetchHiringSignals } from "./hiring";
import { fetchFundingSignals } from "./funding";
import { fetchPodcastSignals } from "./podcasts";
import { correlateSignals } from "./correlate";

export { generateWeeklyDigest, isoWeekStart, getLatestDigest } from "./digest";
export { correlateSignals } from "./correlate";

async function upsertPost(competitorId: string, p: RawPost): Promise<void> {
  // Race-safe upsert via the (competitor_id, source, external_id) unique
  // index. Engagers are only overwritten when ingestion returned a list
  // (an empty list still wins; undefined preserves the existing value).
  const setOnConflict: Record<string, any> = {
    url: p.url,
    author: p.author,
    title: p.title,
    text: p.text,
    publishedAt: p.publishedAt,
    rawLikes: p.rawLikes ?? null,
    rawComments: p.rawComments ?? null,
    rawReposts: p.rawReposts ?? null,
  };
  if (p.engagers !== undefined) setOnConflict.engagers = p.engagers ?? [];
  await db
    .insert(intelCompetitorPosts)
    .values({
      competitorId,
      source: p.source,
      externalId: p.externalId,
      url: p.url,
      author: p.author,
      title: p.title,
      text: p.text,
      publishedAt: p.publishedAt,
      rawLikes: p.rawLikes ?? null,
      rawComments: p.rawComments ?? null,
      rawReposts: p.rawReposts ?? null,
      engagers: p.engagers ?? null,
    })
    .onConflictDoUpdate({
      target: [intelCompetitorPosts.competitorId, intelCompetitorPosts.source, intelCompetitorPosts.externalId],
      set: setOnConflict,
    });
}

export async function refreshCompetitor(c: IntelCompetitor): Promise<{ ingested: number; sources: Record<string, number> }> {
  const sources: Record<string, number> = { rss: 0, x: 0, linkedin: 0 };
  const all: RawPost[] = [];
  if (c.blogRssUrl) {
    try {
      const items = await fetchRss(c.blogRssUrl);
      sources.rss = items.length;
      all.push(...items);
    } catch {}
  }
  if (c.xHandle) {
    try {
      const items = await fetchXTimeline(c.userId, c.xHandle);
      sources.x = items.length;
      all.push(...items);
    } catch {}
  }
  if (c.linkedinCompanyUrl) {
    try {
      const items = await fetchLinkedInCompanyPosts(c.userId, c.linkedinCompanyUrl);
      sources.linkedin = items.length;
      all.push(...items);
    } catch {}
  }
  for (const p of all) {
    try { await upsertPost(c.id, p); } catch {}
  }
  // Module 2: ingest external signals (hiring / funding / podcast) alongside
  // content. Each source is best-effort and never throws out to the caller.
  try { await refreshSignals(c); } catch {}
  await db
    .update(intelCompetitors)
    .set({ lastRefreshedAt: new Date() })
    .where(eq(intelCompetitors.id, c.id));
  return { ingested: all.length, sources };
}

// ---- Module 2: Signal Correlation ingestion --------------------------------

export async function refreshSignals(c: IntelCompetitor): Promise<{ hiring: number; funding: number; podcast: number }> {
  const counts = { hiring: 0, funding: 0, podcast: 0 };
  if (c.jobBoardUrl) {
    try {
      const items = await fetchHiringSignals(c.jobBoardUrl);
      counts.hiring = items.length;
      for (const h of items) {
        try {
          await db.insert(intelHiringSignals).values({
            competitorId: c.id,
            source: h.source,
            externalId: h.externalId,
            title: h.title,
            url: h.url,
            location: h.location,
            department: h.department,
            isGtmRole: h.isGtmRole,
            postedAt: h.postedAt,
          }).onConflictDoUpdate({
            target: [intelHiringSignals.competitorId, intelHiringSignals.source, intelHiringSignals.externalId],
            set: { title: h.title, url: h.url, location: h.location, department: h.department, isGtmRole: h.isGtmRole, postedAt: h.postedAt },
          });
        } catch {}
      }
    } catch {}
  }
  if (c.fundingRssUrl) {
    try {
      const items = await fetchFundingSignals(c.fundingRssUrl);
      counts.funding = items.length;
      for (const f of items) {
        try {
          await db.insert(intelFundingSignals).values({
            competitorId: c.id,
            externalId: f.externalId,
            title: f.title,
            url: f.url,
            amount: f.amount,
            publishedAt: f.publishedAt,
          }).onConflictDoUpdate({
            target: [intelFundingSignals.competitorId, intelFundingSignals.externalId],
            set: { title: f.title, url: f.url, amount: f.amount, publishedAt: f.publishedAt },
          });
        } catch {}
      }
    } catch {}
  }
  if (c.execNames && c.execNames.length > 0) {
    try {
      const items = await fetchPodcastSignals(c.execNames);
      counts.podcast = items.length;
      for (const p of items) {
        try {
          await db.insert(intelPodcastSignals).values({
            competitorId: c.id,
            externalId: p.externalId,
            guest: p.guest,
            showName: p.showName,
            episodeTitle: p.episodeTitle,
            url: p.url,
            publishedAt: p.publishedAt,
          }).onConflictDoUpdate({
            target: [intelPodcastSignals.competitorId, intelPodcastSignals.externalId],
            set: { guest: p.guest, showName: p.showName, episodeTitle: p.episodeTitle, url: p.url, publishedAt: p.publishedAt },
          });
        } catch {}
      }
    } catch {}
  }
  return counts;
}

export async function refreshAndDigest(c: IntelCompetitor, weekStart?: Date) {
  await refreshCompetitor(c);
  const digest = await generateWeeklyDigest(c.id, weekStart);
  // Correlate after the digest exists so themes are available to match against.
  try { await correlateSignals(c.id); } catch {}
  return digest;
}
