import crypto from "crypto";
import { db } from "../db";
import { socialConnections, users, type SocialConnection } from "@shared/schema";
import { and, eq } from "drizzle-orm";

const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo";
const LINKEDIN_UGC_URL = "https://api.linkedin.com/v2/ugcPosts";
const LINKEDIN_SOCIAL_ACTIONS = "https://api.linkedin.com/v2/socialActions";
const SCOPES = ["openid", "profile", "email", "w_member_social"];

export function isLinkedInConfigured(): boolean {
  return !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
}

function getKey(): Buffer {
  // Fail closed: never encrypt tokens with a hardcoded fallback. Operators
  // must provide AUTOPILOT_TOKEN_KEY (preferred) or SESSION_SECRET.
  const k = process.env.AUTOPILOT_TOKEN_KEY || process.env.SESSION_SECRET;
  if (!k || k.length < 16) {
    throw new Error(
      "autopilot-token-key-missing: set AUTOPILOT_TOKEN_KEY (>= 16 chars) before connecting LinkedIn",
    );
  }
  return crypto.createHash("sha256").update(k).digest();
}

export function isTokenKeyConfigured(): boolean {
  const k = process.env.AUTOPILOT_TOKEN_KEY || process.env.SESSION_SECRET;
  return !!k && k.length >= 16;
}

export function encryptToken(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${enc.toString("base64")}`;
}

export function decryptToken(payload: string): string {
  const [ivB64, tagB64, encB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !encB64) throw new Error("invalid-cipher");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(ivB64, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const dec = Buffer.concat([decipher.update(Buffer.from(encB64, "base64")), decipher.final()]);
  return dec.toString("utf8");
}

export function generatePkcePair(): { verifier: string; challenge: string } {
  // RFC 7636: 43-128 char URL-safe verifier; S256 challenge.
  const verifier = crypto.randomBytes(48).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function buildAuthUrl(redirectUri: string, state: string, codeChallenge?: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINKEDIN_CLIENT_ID || "",
    redirect_uri: redirectUri,
    state,
    scope: SCOPES.join(" "),
  });
  if (codeChallenge) {
    params.set("code_challenge", codeChallenge);
    params.set("code_challenge_method", "S256");
  }
  return `${LINKEDIN_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string, redirectUri: string, codeVerifier?: string): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: process.env.LINKEDIN_CLIENT_ID || "",
    client_secret: process.env.LINKEDIN_CLIENT_SECRET || "",
  });
  if (codeVerifier) body.set("code_verifier", codeVerifier);
  const res = await fetch(LINKEDIN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`linkedin-token-${res.status}: ${txt.slice(0, 200)}`);
  }
  return res.json();
}

export async function fetchProfile(accessToken: string): Promise<{
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
}> {
  const res = await fetch(LINKEDIN_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`linkedin-userinfo-${res.status}`);
  return res.json();
}

export async function saveConnection(args: {
  userId: string;
  providerAccountId: string;
  displayName?: string;
  profileUrl?: string;
  accessToken: string;
  refreshToken?: string | null;
  expiresInSeconds?: number;
  scope?: string;
}): Promise<SocialConnection> {
  const expiresAt = args.expiresInSeconds
    ? new Date(Date.now() + args.expiresInSeconds * 1000)
    : null;

  const existing = await db
    .select()
    .from(socialConnections)
    .where(
      and(
        eq(socialConnections.userId, args.userId),
        eq(socialConnections.provider, "linkedin"),
      ),
    );

  let row: SocialConnection;
  if (existing.length) {
    [row] = await db
      .update(socialConnections)
      .set({
        providerAccountId: args.providerAccountId,
        displayName: args.displayName ?? null,
        profileUrl: args.profileUrl ?? null,
        accessTokenCipher: encryptToken(args.accessToken),
        refreshTokenCipher: args.refreshToken ? encryptToken(args.refreshToken) : null,
        accessTokenExpiresAt: expiresAt,
        scope: args.scope ?? SCOPES.join(" "),
        status: "active",
      })
      .where(eq(socialConnections.id, existing[0].id))
      .returning();
  } else {
    [row] = await db
      .insert(socialConnections)
      .values({
        userId: args.userId,
        provider: "linkedin",
        providerAccountId: args.providerAccountId,
        displayName: args.displayName ?? null,
        profileUrl: args.profileUrl ?? null,
        accessTokenCipher: encryptToken(args.accessToken),
        refreshTokenCipher: args.refreshToken ? encryptToken(args.refreshToken) : null,
        accessTokenExpiresAt: expiresAt,
        scope: args.scope ?? SCOPES.join(" "),
        status: "active",
      })
      .returning();
  }
  await db
    .update(users)
    .set({ linkedinConnectionId: row.id, updatedAt: new Date() })
    .where(eq(users.id, args.userId));
  return row;
}

export async function getConnectionForUser(userId: string): Promise<SocialConnection | null> {
  const [c] = await db
    .select()
    .from(socialConnections)
    .where(
      and(
        eq(socialConnections.userId, userId),
        eq(socialConnections.provider, "linkedin"),
        eq(socialConnections.status, "active"),
      ),
    )
    .limit(1);
  return c ?? null;
}

export async function disconnectLinkedIn(userId: string): Promise<{ revokedRemote: boolean; reason?: string }> {
  // Best-effort: revoke the OAuth token at LinkedIn before we drop it locally,
  // so a stolen DB row can't keep posting. LinkedIn supports the standard
  // RFC 7009 token revocation endpoint when client_id/secret are present.
  let revokedRemote = false;
  let reason: string | undefined;
  try {
    const [c] = await db
      .select()
      .from(socialConnections)
      .where(and(eq(socialConnections.userId, userId), eq(socialConnections.provider, "linkedin")))
      .limit(1);
    if (c?.accessTokenCipher && process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
      const token = decryptToken(c.accessTokenCipher);
      const body = new URLSearchParams({
        token,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      });
      const r = await fetch("https://www.linkedin.com/oauth/v2/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      revokedRemote = r.ok;
      if (!r.ok) reason = `revoke-${r.status}`;
    } else {
      reason = "no-client-credentials";
    }
  } catch (e: any) {
    reason = String(e?.message || e);
  }
  await db
    .update(socialConnections)
    .set({ status: "revoked" })
    .where(
      and(
        eq(socialConnections.userId, userId),
        eq(socialConnections.provider, "linkedin"),
      ),
    );
  // Without a publishing channel the agent can't post. Engage the kill switch
  // and pause LinkedIn missions so scheduled runs don't fail loudly.
  await db
    .update(users)
    .set({ linkedinConnectionId: null, autopilotPaused: true, updatedAt: new Date() })
    .where(eq(users.id, userId));
  // Lazy import to avoid circular ref with agent module
  const { missions } = await import("@shared/schema");
  await db
    .update(missions)
    .set({ status: "paused", updatedAt: new Date() })
    .where(and(eq(missions.userId, userId), eq(missions.platform, "linkedin")));
  return { revokedRemote, reason };
}

/**
 * Publishes a text post to LinkedIn as the connected member.
 * Returns the post URN (e.g. "urn:li:share:xxxx").
 */
export async function postToLinkedIn(
  conn: SocialConnection,
  text: string,
): Promise<{ urn: string; url: string }> {
  if (!conn.accessTokenCipher) throw new Error("no-access-token");
  const accessToken = decryptToken(conn.accessTokenCipher);
  const authorUrn = `urn:li:person:${conn.providerAccountId}`;

  const body = {
    author: authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: "NONE",
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };

  const res = await fetch(LINKEDIN_UGC_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`linkedin-post-${res.status}: ${txt.slice(0, 300)}`);
  }
  const json: any = await res.json().catch(() => ({}));
  const urn: string = json.id || res.headers.get("x-restli-id") || "";
  // LinkedIn doesn't give us a clean public URL via this API — best-effort link
  const idPart = urn.split(":").pop() || "";
  const url = idPart ? `https://www.linkedin.com/feed/update/${urn}` : `https://www.linkedin.com/in/${conn.providerAccountId}/recent-activity/all/`;

  await db
    .update(socialConnections)
    .set({ lastUsedAt: new Date() })
    .where(eq(socialConnections.id, conn.id));

  return { urn, url };
}

/**
 * Looks for a recent UGC post by the connected member whose commentary
 * matches `text`. Used by the autopilot reconciler to verify whether a
 * post that crashed mid-call actually reached LinkedIn before deciding
 * to fail the run (and risk a duplicate on retry).
 *
 * Returns the matching post's urn + url when found, or null when not.
 * Only considers posts created within `withinMs` of now to keep the
 * search window bounded — older drafts can't have come from the run we
 * are reconciling.
 *
 * Note: LinkedIn's UGC posts list endpoint requires the `w_member_social`
 * scope (which we already request) and works for the authenticated
 * member's own posts. If the API call fails for any reason we return
 * null so the caller can fall back to its safe default (refuse to retry).
 */
export async function findRecentPostByText(
  conn: SocialConnection,
  text: string,
  withinMs: number = 30 * 60 * 1000,
): Promise<{ urn: string; url: string } | null> {
  if (!conn.accessTokenCipher) return null;
  let accessToken: string;
  try {
    accessToken = decryptToken(conn.accessTokenCipher);
  } catch {
    return null;
  }
  const authorUrn = `urn:li:person:${conn.providerAccountId}`;
  // Normalise so trailing-whitespace / hashtag-spacing differences don't
  // cause a false negative.
  const norm = (s: string) => s.replace(/\s+/g, " ").trim();
  const needle = norm(text);
  const cutoff = Date.now() - withinMs;
  try {
    const url = `${LINKEDIN_UGC_URL}?q=authors&authors=List(${encodeURIComponent(authorUrn)})&count=20&sortBy=CREATED`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });
    if (!res.ok) return null;
    const json: any = await res.json().catch(() => ({}));
    const elements: any[] = Array.isArray(json?.elements) ? json.elements : [];
    for (const el of elements) {
      const created: number | undefined = el?.created?.time ?? el?.firstPublishedAt;
      if (typeof created === "number" && created < cutoff) continue;
      const commentary: string | undefined =
        el?.specificContent?.["com.linkedin.ugc.ShareContent"]?.shareCommentary?.text;
      if (!commentary) continue;
      if (norm(commentary) === needle) {
        const urn: string = el.id || "";
        if (!urn) continue;
        const idPart = urn.split(":").pop() || "";
        const publicUrl = idPart
          ? `https://www.linkedin.com/feed/update/${urn}`
          : `https://www.linkedin.com/in/${conn.providerAccountId}/recent-activity/all/`;
        return { urn, url: publicUrl };
      }
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Fetches engagement counts (likes + comments) for a posted update.
 * LinkedIn's UGC analytics endpoints require additional partner scopes;
 * this uses the publicly-available socialActions endpoint which works for
 * any post the authenticated member can read.
 */
export async function fetchPostStats(
  conn: SocialConnection,
  urn: string,
): Promise<{ likes: number; comments: number; impressions: number | null; clicks: number | null }> {
  if (!conn.accessTokenCipher) throw new Error("no-access-token");
  const accessToken = decryptToken(conn.accessTokenCipher);
  const encUrn = encodeURIComponent(urn);

  let likes = 0;
  let comments = 0;
  try {
    const lr = await fetch(`${LINKEDIN_SOCIAL_ACTIONS}/${encUrn}/likes?count=1`, {
      headers: { Authorization: `Bearer ${accessToken}`, "X-Restli-Protocol-Version": "2.0.0" },
    });
    if (lr.ok) {
      const lj: any = await lr.json();
      likes = lj?.paging?.total ?? 0;
    }
  } catch {}
  try {
    const cr = await fetch(`${LINKEDIN_SOCIAL_ACTIONS}/${encUrn}/comments?count=1`, {
      headers: { Authorization: `Bearer ${accessToken}`, "X-Restli-Protocol-Version": "2.0.0" },
    });
    if (cr.ok) {
      const cj: any = await cr.json();
      comments = cj?.paging?.total ?? 0;
    }
  } catch {}

  // Impressions + clicks live behind the /rest/memberPostAnalytics endpoint
  // (member-level analytics scope). Try it; if the scope isn't granted (most
  // standard apps) report null instead of guessing — callers can decide
  // whether to treat that as "unavailable" rather than silently estimating.
  let impressions: number | null = null;
  let clicks: number | null = null;
  try {
    const ar = await fetch(
      `https://api.linkedin.com/rest/memberPostAnalytics?q=memberAndPosts&posts=List(${encUrn})`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": "202405",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      },
    );
    if (ar.ok) {
      const aj: any = await ar.json();
      const el = aj?.elements?.[0];
      if (el) {
        impressions = typeof el.impressionCount === "number" ? el.impressionCount : null;
        clicks = typeof el.clickCount === "number" ? el.clickCount : null;
      }
    }
  } catch {}

  return { likes, comments, impressions, clicks };
}
