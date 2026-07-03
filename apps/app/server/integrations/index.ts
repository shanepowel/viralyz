/**
 * Platform dispatcher for the autopilot agent. The agent treats every
 * mission's `platform` field as a black box and looks up the right
 * adapter via these helpers — adding a new platform means writing one
 * file in this folder and extending the dispatch tables here.
 */
import type { SocialConnection } from "@shared/schema";
import * as linkedin from "./linkedin";
import * as x from "./x";
import * as threads from "./threads";
import * as instagram from "./instagram";
import { getConnectionForProvider, type Provider } from "./_shared";

export type PlatformId = Provider;

export const SUPPORTED_PLATFORMS: PlatformId[] = ["linkedin", "x", "threads", "instagram"];

export const PLATFORM_LABEL: Record<PlatformId, string> = {
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  threads: "Threads",
  instagram: "Instagram",
};

/** Each platform exposes a hard or soft character cap that informs the
 * model when drafting. The agent feeds this into prompt context so a
 * tweet doesn't come out 800 characters long. */
export const PLATFORM_CHAR_LIMIT: Record<PlatformId, number> = {
  linkedin: 3000,
  x: 280,
  threads: 500,
  instagram: 2200,
};

export function isPlatformConfigured(platform: PlatformId): boolean {
  switch (platform) {
    case "linkedin": return linkedin.isLinkedInConfigured();
    case "x": return x.isXConfigured();
    case "threads": return threads.isThreadsConfigured();
    case "instagram": return instagram.isInstagramConfigured();
  }
}

export async function getConnectionForPlatform(
  userId: string,
  platform: PlatformId,
): Promise<SocialConnection | null> {
  return getConnectionForProvider(userId, platform);
}

export async function postToPlatform(
  platform: PlatformId,
  conn: SocialConnection,
  text: string,
  opts: { mediaUrl?: string } = {},
): Promise<{ urn: string; url: string }> {
  switch (platform) {
    case "linkedin": return linkedin.postToLinkedIn(conn, text);
    case "x": return x.postToX(conn, text);
    case "threads": return threads.postToThreads(conn, text);
    case "instagram": return instagram.postToInstagram(conn, text, opts.mediaUrl);
  }
}

export async function fetchPostStatsForPlatform(
  platform: PlatformId,
  conn: SocialConnection,
  externalId: string,
): Promise<{ likes: number; comments: number; impressions: number | null; clicks: number | null }> {
  switch (platform) {
    case "linkedin": return linkedin.fetchPostStats(conn, externalId);
    case "x": return x.fetchPostStats(conn, externalId);
    case "threads": return threads.fetchPostStats(conn, externalId);
    case "instagram": return instagram.fetchPostStats(conn, externalId);
  }
}
