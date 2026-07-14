/**
 * Reads a public X handle's recent tweets using the requesting user's X
 * connection token. Best-effort: returns [] if no token, the handle can't
 * be resolved, or X rate-limits. Does NOT bypass auth or use scraping.
 */
import { db } from "../db";
import { and, eq } from "drizzle-orm";
import { socialConnections } from "@shared/schema";
import { decryptToken } from "../integrations/_shared";
import type { RawPost } from "./rss";

async function getXToken(userId: string): Promise<string | null> {
  try {
    const [conn] = await db
      .select()
      .from(socialConnections)
      .where(
        and(
          eq(socialConnections.userId, userId),
          eq(socialConnections.provider, "x"),
          eq(socialConnections.status, "active"),
        ),
      )
      .limit(1);
    if (!conn?.accessTokenCipher) return null;
    return decryptToken(conn.accessTokenCipher);
  } catch {
    return null;
  }
}

export async function fetchXTimeline(userId: string, handle: string, withinMs = 14 * 24 * 60 * 60 * 1000): Promise<RawPost[]> {
  const token = await getXToken(userId);
  if (!token) return [];
  const cleanHandle = handle.replace(/^@/, "").trim();
  if (!cleanHandle) return [];
  let userIdX: string | null = null;
  try {
    const r = await fetch(`https://api.twitter.com/2/users/by/username/${encodeURIComponent(cleanHandle)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return [];
    const j: any = await r.json();
    userIdX = j?.data?.id || null;
  } catch {
    return [];
  }
  if (!userIdX) return [];
  let tweets: any[] = [];
  try {
    const r = await fetch(
      `https://api.twitter.com/2/users/${userIdX}/tweets?max_results=20&tweet.fields=created_at,public_metrics,text,conversation_id`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!r.ok) return [];
    const j: any = await r.json();
    tweets = Array.isArray(j?.data) ? j.data : [];
  } catch {
    return [];
  }
  const cutoff = Date.now() - withinMs;
  const out: RawPost[] = [];
  for (const t of tweets) {
    const pub = t.created_at ? new Date(t.created_at) : null;
    if (pub && pub.getTime() < cutoff) continue;
    const m = t.public_metrics || {};
    const replyCount = m.reply_count ?? 0;
    const engagers = replyCount > 0 ? await fetchReplyEngagers(token, t.conversation_id || t.id) : [];
    out.push({
      source: "x",
      externalId: String(t.id),
      url: `https://twitter.com/${cleanHandle}/status/${t.id}`,
      author: cleanHandle,
      title: null,
      text: t.text || null,
      publishedAt: pub,
      rawLikes: m.like_count ?? null,
      rawComments: replyCount,
      rawReposts: m.retweet_count ?? null,
      engagers,
    });
  }
  return out;
}

/**
 * Best-effort: fetch up to ~20 reply authors for a tweet conversation and
 * map them into engager records. The X v2 recent-search endpoint requires
 * elevated access for some tokens; on failure we return [] silently so the
 * digest pipeline still produces raw counts.
 */
async function fetchReplyEngagers(
  token: string,
  conversationId: string,
): Promise<Array<{ name: string; title?: string; company?: string }>> {
  try {
    const url =
      `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(`conversation_id:${conversationId} is:reply`)}` +
      `&max_results=20&expansions=author_id&user.fields=name,username,description`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) return [];
    const j: any = await r.json();
    const usersList: any[] = Array.isArray(j?.includes?.users) ? j.includes.users : [];
    const seen = new Set<string>();
    const out: Array<{ name: string; title?: string; company?: string }> = [];
    for (const u of usersList) {
      const key = u.username || u.id;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const desc: string = u.description || "";
      // Extract a likely title from the bio: text before "@", "|", or first sentence.
      let title: string | undefined;
      let company: string | undefined;
      const atSplit = desc.split(/\s@\s|\s\|\s|\sat\s/i);
      if (atSplit.length > 0 && atSplit[0].trim().length > 0 && atSplit[0].length < 100) {
        title = atSplit[0].trim();
      }
      if (atSplit.length > 1 && atSplit[1].trim().length > 0 && atSplit[1].length < 80) {
        company = atSplit[1].trim().split(/[.\n]/)[0];
      }
      out.push({ name: u.name || u.username, title, company });
    }
    return out;
  } catch {
    return [];
  }
}
