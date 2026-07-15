import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { socialConnections, users, type SocialConnection } from "@shared/schema";

export type Provider = "linkedin" | "x" | "threads" | "instagram";

function getKey(): Buffer {
  const k = process.env.AUTOPILOT_TOKEN_KEY || process.env.SESSION_SECRET;
  if (!k || k.length < 16) {
    throw new Error(
      "autopilot-token-key-missing: set AUTOPILOT_TOKEN_KEY (>= 16 chars) before connecting social accounts",
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
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const dec = Buffer.concat([decipher.update(Buffer.from(encB64, "base64")), decipher.final()]);
  return dec.toString("utf8");
}

export function generatePkcePair(): { verifier: string; challenge: string } {
  const verifier = crypto.randomBytes(48).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

const USER_COL: Record<Provider, "linkedinConnectionId" | "xConnectionId" | "threadsConnectionId" | "instagramConnectionId"> = {
  linkedin: "linkedinConnectionId",
  x: "xConnectionId",
  threads: "threadsConnectionId",
  instagram: "instagramConnectionId",
};

export async function upsertConnection(args: {
  provider: Provider;
  userId: string;
  providerAccountId: string;
  displayName?: string | null;
  profileUrl?: string | null;
  accessToken: string;
  refreshToken?: string | null;
  expiresInSeconds?: number;
  scope?: string | null;
}): Promise<SocialConnection> {
  const expiresAt = args.expiresInSeconds
    ? new Date(Date.now() + args.expiresInSeconds * 1000)
    : null;

  const existing = await db
    .select()
    .from(socialConnections)
    .where(and(eq(socialConnections.userId, args.userId), eq(socialConnections.provider, args.provider)));

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
        scope: args.scope ?? null,
        status: "active",
      })
      .where(eq(socialConnections.id, existing[0].id))
      .returning();
  } else {
    [row] = await db
      .insert(socialConnections)
      .values({
        userId: args.userId,
        provider: args.provider,
        providerAccountId: args.providerAccountId,
        displayName: args.displayName ?? null,
        profileUrl: args.profileUrl ?? null,
        accessTokenCipher: encryptToken(args.accessToken),
        refreshTokenCipher: args.refreshToken ? encryptToken(args.refreshToken) : null,
        accessTokenExpiresAt: expiresAt,
        scope: args.scope ?? null,
        status: "active",
      })
      .returning();
  }
  await db
    .update(users)
    .set({ [USER_COL[args.provider]]: row.id, updatedAt: new Date() } as any)
    .where(eq(users.id, args.userId));
  return row;
}

export async function getConnectionForProvider(
  userId: string,
  provider: Provider,
): Promise<SocialConnection | null> {
  const [c] = await db
    .select()
    .from(socialConnections)
    .where(
      and(
        eq(socialConnections.userId, userId),
        eq(socialConnections.provider, provider),
        eq(socialConnections.status, "active"),
      ),
    )
    .limit(1);
  return c ?? null;
}

/**
 * Mark a connection revoked locally and pause the kill switch + matching
 * missions. Mirrors the LinkedIn behaviour for the new providers.
 */
export async function markDisconnected(userId: string, provider: Provider): Promise<void> {
  await db
    .update(socialConnections)
    .set({ status: "revoked" })
    .where(and(eq(socialConnections.userId, userId), eq(socialConnections.provider, provider)));
  await db
    .update(users)
    .set({ [USER_COL[provider]]: null, autopilotPaused: true, updatedAt: new Date() } as any)
    .where(eq(users.id, userId));
  const { missions } = await import("@shared/schema");
  const { eq: _eq, and: _and } = await import("drizzle-orm");
  await db
    .update(missions)
    .set({ status: "paused", updatedAt: new Date() })
    .where(_and(_eq(missions.userId, userId), _eq(missions.platform, provider)));
}
