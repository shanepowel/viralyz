/**
 * X (Twitter) v2 OAuth 2.0 PKCE + tweet publishing/measurement adapter.
 * Mirrors the surface of integrations/linkedin.ts so the agent can dispatch
 * by mission.platform.
 */
import { db } from "../db";
import { eq } from "drizzle-orm";
import { socialConnections, type SocialConnection } from "@shared/schema";
import {
  decryptToken,
  encryptToken,
  generatePkcePair,
  getConnectionForProvider,
  markDisconnected,
  upsertConnection,
} from "./_shared";

export { generatePkcePair };

const AUTH_URL = "https://twitter.com/i/oauth2/authorize";
const TOKEN_URL = "https://api.twitter.com/2/oauth2/token";
const USERINFO_URL = "https://api.twitter.com/2/users/me";
const TWEETS_URL = "https://api.twitter.com/2/tweets";
const SCOPES = ["tweet.read", "tweet.write", "users.read", "offline.access"];

export function isXConfigured(): boolean {
  return !!(process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET);
}

export function buildAuthUrl(redirectUri: string, state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.X_CLIENT_ID || "",
    redirect_uri: redirectUri,
    scope: SCOPES.join(" "),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string,
  codeVerifier: string,
): Promise<{ access_token: string; expires_in: number; refresh_token?: string; scope?: string }> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: process.env.X_CLIENT_ID || "",
    code_verifier: codeVerifier,
  });
  const auth = Buffer.from(
    `${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`,
  ).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`x-token-${res.status}: ${t.slice(0, 200)}`);
  }
  return res.json();
}

export async function fetchProfile(accessToken: string): Promise<{ id: string; name?: string; username?: string }> {
  const res = await fetch(`${USERINFO_URL}?user.fields=name,username`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`x-userinfo-${res.status}`);
  const json: any = await res.json();
  return { id: json?.data?.id, name: json?.data?.name, username: json?.data?.username };
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
  return upsertConnection({ provider: "x", ...args, scope: args.scope ?? SCOPES.join(" ") });
}

export async function getConnectionForUser(userId: string): Promise<SocialConnection | null> {
  return getConnectionForProvider(userId, "x");
}

export async function disconnectX(userId: string): Promise<{ revokedRemote: boolean; reason?: string }> {
  let revokedRemote = false;
  let reason: string | undefined;
  try {
    const conn = await getConnectionForProvider(userId, "x");
    if (conn?.accessTokenCipher && process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET) {
      const token = decryptToken(conn.accessTokenCipher);
      const auth = Buffer.from(
        `${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`,
      ).toString("base64");
      const r = await fetch("https://api.twitter.com/2/oauth2/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
        body: new URLSearchParams({ token, token_type_hint: "access_token" }),
      });
      revokedRemote = r.ok;
      if (!r.ok) reason = `revoke-${r.status}`;
    } else {
      reason = "no-client-credentials";
    }
  } catch (e: any) {
    reason = String(e?.message || e);
  }
  await markDisconnected(userId, "x");
  return { revokedRemote, reason };
}

export async function postToX(conn: SocialConnection, text: string): Promise<{ urn: string; url: string }> {
  if (!conn.accessTokenCipher) throw new Error("no-access-token");
  // X tweets are hard-capped at 280 chars (Premium/X pays for longer).
  // Trim explicitly so we fail loud if a longer draft is requested.
  if (text.length > 280) throw new Error(`x-tweet-too-long-${text.length}`);
  const accessToken = decryptToken(conn.accessTokenCipher);
  const res = await fetch(TWEETS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`x-post-${res.status}: ${t.slice(0, 300)}`);
  }
  const json: any = await res.json().catch(() => ({}));
  const id: string = json?.data?.id || "";
  if (!id) throw new Error("x-post-no-id");
  const handle = conn.displayName || conn.providerAccountId;
  const url = `https://x.com/${handle}/status/${id}`;
  await db.update(socialConnections).set({ lastUsedAt: new Date() }).where(eq(socialConnections.id, conn.id));
  return { urn: id, url };
}

export async function fetchPostStats(
  conn: SocialConnection,
  externalId: string,
): Promise<{ likes: number; comments: number; impressions: number | null; clicks: number | null }> {
  if (!conn.accessTokenCipher) throw new Error("no-access-token");
  const accessToken = decryptToken(conn.accessTokenCipher);
  const res = await fetch(
    `https://api.twitter.com/2/tweets/${externalId}?tweet.fields=public_metrics,non_public_metrics`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) {
    return { likes: 0, comments: 0, impressions: null, clicks: null };
  }
  const json: any = await res.json().catch(() => ({}));
  const pm = json?.data?.public_metrics || {};
  const npm = json?.data?.non_public_metrics || {};
  return {
    likes: pm.like_count ?? 0,
    comments: pm.reply_count ?? 0,
    impressions: typeof npm.impression_count === "number" ? npm.impression_count : (typeof pm.impression_count === "number" ? pm.impression_count : null),
    clicks: typeof npm.url_link_clicks === "number" ? npm.url_link_clicks : null,
  };
}

export { encryptToken };
