/**
 * Instagram Graph API adapter (Business / Creator accounts via Facebook
 * Login). Connect + status work end-to-end; publishing requires media
 * (image_url or video_url) so a text-only autopilot run will fail loudly
 * with `instagram-requires-media` rather than silently produce nothing.
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

const AUTH_URL = "https://www.facebook.com/v19.0/dialog/oauth";
const TOKEN_URL = "https://graph.facebook.com/v19.0/oauth/access_token";
const GRAPH = "https://graph.facebook.com/v19.0";
const SCOPES = ["instagram_basic", "instagram_content_publish", "pages_show_list", "pages_read_engagement"];

export function isInstagramConfigured(): boolean {
  return !!(process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET);
}

export function buildAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_CLIENT_ID || "",
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
): Promise<{ access_token: string; expires_in?: number }> {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_CLIENT_ID || "",
    client_secret: process.env.INSTAGRAM_CLIENT_SECRET || "",
    redirect_uri: redirectUri,
    code,
  });
  const res = await fetch(`${TOKEN_URL}?${params.toString()}`);
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`instagram-token-${res.status}: ${t.slice(0, 200)}`);
  }
  return res.json();
}

/**
 * Resolve the IG Business account id linked to the first managed Page.
 * Returns null if no IG-Business-account is connected to any of the
 * authorising user's Pages.
 */
export async function fetchProfile(
  accessToken: string,
): Promise<{ id: string; username?: string; name?: string } | null> {
  const pages = await fetch(`${GRAPH}/me/accounts?access_token=${encodeURIComponent(accessToken)}`);
  if (!pages.ok) throw new Error(`instagram-pages-${pages.status}`);
  const pj: any = await pages.json();
  for (const page of pj?.data ?? []) {
    const r = await fetch(
      `${GRAPH}/${page.id}?fields=instagram_business_account{id,username,name}&access_token=${encodeURIComponent(accessToken)}`,
    );
    if (!r.ok) continue;
    const j: any = await r.json();
    const ig = j?.instagram_business_account;
    if (ig?.id) return { id: ig.id, username: ig.username, name: ig.name };
  }
  return null;
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
  return upsertConnection({ provider: "instagram", ...args, scope: args.scope ?? SCOPES.join(",") });
}

export async function getConnectionForUser(userId: string): Promise<SocialConnection | null> {
  return getConnectionForProvider(userId, "instagram");
}

export async function disconnectInstagram(userId: string): Promise<{ revokedRemote: boolean; reason?: string }> {
  let revokedRemote = false;
  let reason: string | undefined;
  try {
    const conn = await getConnectionForProvider(userId, "instagram");
    if (conn?.accessTokenCipher) {
      const token = decryptToken(conn.accessTokenCipher);
      const r = await fetch(`${GRAPH}/me/permissions?access_token=${encodeURIComponent(token)}`, {
        method: "DELETE",
      });
      revokedRemote = r.ok;
      if (!r.ok) reason = `revoke-${r.status}`;
    }
  } catch (e: any) {
    reason = String(e?.message || e);
  }
  await markDisconnected(userId, "instagram");
  return { revokedRemote, reason };
}

export async function postToInstagram(
  conn: SocialConnection,
  text: string,
  mediaUrl?: string,
): Promise<{ urn: string; url: string }> {
  if (!conn.accessTokenCipher) throw new Error("no-access-token");
  // Instagram Graph API requires image_url or video_url — there is no text-
  // only post primitive. Fail closed instead of silently producing nothing.
  if (!mediaUrl) {
    throw new Error("instagram-requires-media: attach an image_url before publishing");
  }
  const accessToken = decryptToken(conn.accessTokenCipher);
  const ig = conn.providerAccountId;

  const create = await fetch(
    `${GRAPH}/${ig}/media?image_url=${encodeURIComponent(mediaUrl)}&caption=${encodeURIComponent(text)}&access_token=${encodeURIComponent(accessToken)}`,
    { method: "POST" },
  );
  if (!create.ok) {
    const t = await create.text().catch(() => "");
    throw new Error(`instagram-container-${create.status}: ${t.slice(0, 300)}`);
  }
  const cj: any = await create.json();
  const containerId: string = cj?.id;
  if (!containerId) throw new Error("instagram-no-container-id");

  const publish = await fetch(
    `${GRAPH}/${ig}/media_publish?creation_id=${encodeURIComponent(containerId)}&access_token=${encodeURIComponent(accessToken)}`,
    { method: "POST" },
  );
  if (!publish.ok) {
    const t = await publish.text().catch(() => "");
    throw new Error(`instagram-publish-${publish.status}: ${t.slice(0, 300)}`);
  }
  const pj: any = await publish.json();
  const id: string = pj?.id;
  if (!id) throw new Error("instagram-no-media-id");
  const url = `https://www.instagram.com/p/${id}`;
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
    `${GRAPH}/${mediaId}/insights?metric=impressions,reach,likes,comments&access_token=${encodeURIComponent(accessToken)}`,
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
    comments: map.get("comments") ?? 0,
    impressions: map.has("impressions") ? map.get("impressions")! : (map.has("reach") ? map.get("reach")! : null),
    clicks: null,
  };
}
