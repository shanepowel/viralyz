/**
 * Meta Threads Graph API adapter. OAuth 2.0 (no PKCE), text post via
 * two-step container/publish flow, insights via /{media-id}/insights.
 */
import { db } from "../db";
import { eq } from "drizzle-orm";
import { socialConnections, type SocialConnection } from "@shared/schema";
import {
  decryptToken,
  getConnectionForProvider,
  markDisconnected,
  upsertConnection,
} from "./_shared";

const AUTH_URL = "https://threads.net/oauth/authorize";
const TOKEN_URL = "https://graph.threads.net/oauth/access_token";
const GRAPH = "https://graph.threads.net/v1.0";
const SCOPES = ["threads_basic", "threads_content_publish", "threads_manage_insights"];

export function isThreadsConfigured(): boolean {
  return !!(process.env.THREADS_CLIENT_ID && process.env.THREADS_CLIENT_SECRET);
}

export function buildAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.THREADS_CLIENT_ID || "",
    redirect_uri: redirectUri,
    scope: SCOPES.join(","),
    response_type: "code",
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string,
): Promise<{ access_token: string; user_id: string; expires_in?: number }> {
  const body = new URLSearchParams({
    client_id: process.env.THREADS_CLIENT_ID || "",
    client_secret: process.env.THREADS_CLIENT_SECRET || "",
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`threads-token-${res.status}: ${t.slice(0, 200)}`);
  }
  return res.json();
}

export async function fetchProfile(accessToken: string, userId: string): Promise<{ id: string; username?: string; name?: string }> {
  const res = await fetch(
    `${GRAPH}/${userId}?fields=id,username,name&access_token=${encodeURIComponent(accessToken)}`,
  );
  if (!res.ok) throw new Error(`threads-userinfo-${res.status}`);
  return res.json();
}

export async function saveConnection(args: {
  userId: string;
  providerAccountId: string;
  displayName?: string;
  profileUrl?: string;
  accessToken: string;
  expiresInSeconds?: number;
  scope?: string;
}): Promise<SocialConnection> {
  return upsertConnection({ provider: "threads", ...args, scope: args.scope ?? SCOPES.join(",") });
}

export async function getConnectionForUser(userId: string): Promise<SocialConnection | null> {
  return getConnectionForProvider(userId, "threads");
}

export async function disconnectThreads(userId: string): Promise<{ revokedRemote: boolean; reason?: string }> {
  // Threads has no OAuth revoke endpoint that clients can hit on a user's
  // behalf (only the user can remove the app from their settings). Revoke
  // locally and rely on the user cleaning up at threads.net if desired.
  await markDisconnected(userId, "threads");
  return { revokedRemote: false, reason: "threads-no-revoke-endpoint" };
}

export async function postToThreads(
  conn: SocialConnection,
  text: string,
): Promise<{ urn: string; url: string }> {
  if (!conn.accessTokenCipher) throw new Error("no-access-token");
  if (text.length > 500) throw new Error(`threads-post-too-long-${text.length}`);
  const accessToken = decryptToken(conn.accessTokenCipher);
  const ig = conn.providerAccountId;

  // Step 1: create the media container (text only)
  const create = await fetch(
    `${GRAPH}/${ig}/threads?media_type=TEXT&text=${encodeURIComponent(text)}&access_token=${encodeURIComponent(accessToken)}`,
    { method: "POST" },
  );
  if (!create.ok) {
    const t = await create.text().catch(() => "");
    throw new Error(`threads-container-${create.status}: ${t.slice(0, 300)}`);
  }
  const cj: any = await create.json();
  const containerId: string = cj?.id;
  if (!containerId) throw new Error("threads-no-container-id");

  // Step 2: publish
  const publish = await fetch(
    `${GRAPH}/${ig}/threads_publish?creation_id=${encodeURIComponent(containerId)}&access_token=${encodeURIComponent(accessToken)}`,
    { method: "POST" },
  );
  if (!publish.ok) {
    const t = await publish.text().catch(() => "");
    throw new Error(`threads-publish-${publish.status}: ${t.slice(0, 300)}`);
  }
  const pj: any = await publish.json();
  const id: string = pj?.id || "";
  if (!id) throw new Error("threads-no-media-id");
  const handle = conn.displayName || ig;
  const url = `https://www.threads.net/@${handle}/post/${id}`;
  await db.update(socialConnections).set({ lastUsedAt: new Date() }).where(eq(socialConnections.id, conn.id));
  return { urn: id, url };
}

export async function fetchPostStats(
  conn: SocialConnection,
  mediaId: string,
): Promise<{ likes: number; comments: number; impressions: number | null; clicks: number | null }> {
  if (!conn.accessTokenCipher) throw new Error("no-access-token");
  const accessToken = decryptToken(conn.accessTokenCipher);
  const res = await fetch(
    `${GRAPH}/${mediaId}/insights?metric=likes,replies,reposts,quotes,views&access_token=${encodeURIComponent(accessToken)}`,
  );
  if (!res.ok) return { likes: 0, comments: 0, impressions: null, clicks: null };
  const json: any = await res.json().catch(() => ({}));
  const map = new Map<string, number>();
  for (const m of json?.data ?? []) {
    const v = m?.values?.[0]?.value ?? 0;
    map.set(m.name, typeof v === "number" ? v : 0);
  }
  return {
    likes: map.get("likes") ?? 0,
    comments: map.get("replies") ?? 0,
    impressions: map.has("views") ? map.get("views")! : null,
    clicks: null,
  };
}
