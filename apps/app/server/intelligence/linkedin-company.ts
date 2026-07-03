/**
 * Best-effort LinkedIn company-page reader. Most apps will NOT have the
 * `r_organization_social` scope required by the official organizationalEntityShareStatistics
 * endpoint, so this almost always returns []. We keep the surface here so the rest of
 * the pipeline can call it uniformly. When it does work (pages where the connected
 * member is an admin and partner scopes are granted), it returns recent UGC posts.
 */
import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { socialConnections } from "@shared/schema";
import { decryptToken } from "../integrations/_shared";
import type { RawPost } from "./rss";

const COMPANY_URL_RX = /linkedin\.com\/company\/([^\/?#]+)/i;

function extractCompanySlug(url: string): string | null {
  const m = url.match(COMPANY_URL_RX);
  return m ? decodeURIComponent(m[1]) : null;
}

export async function fetchLinkedInCompanyPosts(userId: string, companyUrl: string): Promise<RawPost[]> {
  const slug = extractCompanySlug(companyUrl);
  if (!slug) return [];
  const [conn] = await db
    .select()
    .from(socialConnections)
    .where(and(eq(socialConnections.userId, userId), eq(socialConnections.provider, "linkedin"), eq(socialConnections.status, "active")))
    .limit(1);
  if (!conn?.accessTokenCipher) return [];
  let token: string;
  try { token = decryptToken(conn.accessTokenCipher); } catch { return []; }
  // Resolve org id by vanity name. Requires r_organization_social; will 403 for most apps.
  let orgId: string | null = null;
  try {
    const r = await fetch(`https://api.linkedin.com/v2/organizations?q=vanityName&vanityName=${encodeURIComponent(slug)}`, {
      headers: { Authorization: `Bearer ${token}`, "X-Restli-Protocol-Version": "2.0.0" },
    });
    if (!r.ok) return [];
    const j: any = await r.json();
    orgId = j?.elements?.[0]?.id ? String(j.elements[0].id) : null;
  } catch {
    return [];
  }
  if (!orgId) return [];
  const orgUrn = `urn:li:organization:${orgId}`;
  try {
    const r = await fetch(
      `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(${encodeURIComponent(orgUrn)})&count=20&sortBy=CREATED`,
      { headers: { Authorization: `Bearer ${token}`, "X-Restli-Protocol-Version": "2.0.0" } },
    );
    if (!r.ok) return [];
    const j: any = await r.json();
    const els: any[] = Array.isArray(j?.elements) ? j.elements : [];
    return els.slice(0, 20).map((el): RawPost => {
      const urn = el?.id || "";
      const text =
        el?.specificContent?.["com.linkedin.ugc.ShareContent"]?.shareCommentary?.text ?? null;
      const created = el?.created?.time ?? el?.firstPublishedAt;
      return {
        source: "linkedin",
        externalId: urn,
        url: urn ? `https://www.linkedin.com/feed/update/${urn}` : null,
        author: slug,
        title: null,
        text,
        publishedAt: typeof created === "number" ? new Date(created) : null,
      };
    });
  } catch {
    return [];
  }
}
