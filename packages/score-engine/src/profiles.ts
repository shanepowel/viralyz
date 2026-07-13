import type { ScoringPlatform } from "./types";

export interface ScoringProfile {
  id: string;
  version: string;
  platform: ScoringPlatform;
  label: string;
  /** Seconds that define the critical hook window */
  hookWindowSeconds: number;
  /** Extra prompt guidance injected into the score job */
  focus: string;
  weights: {
    hook: number;
    visual: number;
    structure: number;
    metadata: number;
    timing: number;
  };
}

/** Sum of weights must be 1.0 — used to blend component scores into viralScore when recalibrating */
export const SCORING_PROFILES: Record<string, ScoringProfile> = {
  "tiktok@v1": {
    id: "tiktok",
    version: "tiktok@v1",
    platform: "tiktok",
    label: "TikTok",
    hookWindowSeconds: 3,
    focus:
      "Score for 9:16 vertical, 0–3s hook retention, pattern interrupts, on-screen text legibility, sound-on culture, and loop potential. Penalize slow opens and static first frames.",
    weights: { hook: 0.3, visual: 0.2, structure: 0.2, metadata: 0.15, timing: 0.15 },
  },
  "instagram_reels@v1": {
    id: "instagram_reels",
    version: "instagram_reels@v1",
    platform: "instagram_reels",
    label: "Instagram Reels",
    hookWindowSeconds: 3,
    focus:
      "Score for Reels discovery: strong first frame as thumbnail, aesthetic cohesion, caption-first discovery, trending audio fit, and save/share potential.",
    weights: { hook: 0.28, visual: 0.25, structure: 0.17, metadata: 0.18, timing: 0.12 },
  },
  "youtube_shorts@v1": {
    id: "youtube_shorts",
    version: "youtube_shorts@v1",
    platform: "youtube_shorts",
    label: "YouTube Shorts",
    hookWindowSeconds: 3,
    focus:
      "Score for Shorts shelf: immediate value promise, retention through mid-roll, end-screen loop, and search-friendly title/description without hashtag spam.",
    weights: { hook: 0.28, visual: 0.18, structure: 0.22, metadata: 0.2, timing: 0.12 },
  },
  "youtube@v1": {
    id: "youtube",
    version: "youtube@v1",
    platform: "youtube",
    label: "YouTube long-form",
    hookWindowSeconds: 30,
    focus:
      "Score for long-form: thumbnail CTR potential, first 30s cold-open, chapter pacing, search/SEO metadata, and watch-time durability. Hook window is 30 seconds not 3.",
    weights: { hook: 0.22, visual: 0.22, structure: 0.25, metadata: 0.2, timing: 0.11 },
  },
  "x@v1": {
    id: "x",
    version: "x@v1",
    platform: "x",
    label: "X (Twitter)",
    hookWindowSeconds: 2,
    focus:
      "Score for X: punchy first line as the hook, quote-tweet potential, thread structure if applicable, media that reads at feed scale, and timely cultural relevance.",
    weights: { hook: 0.32, visual: 0.15, structure: 0.2, metadata: 0.18, timing: 0.15 },
  },
  "linkedin@v1": {
    id: "linkedin",
    version: "linkedin@v1",
    platform: "linkedin",
    label: "LinkedIn",
    hookWindowSeconds: 5,
    focus:
      "Score for LinkedIn: professional credibility, story-led hook, scannable structure, value density, and posting-time for B2B audience active hours.",
    weights: { hook: 0.25, visual: 0.12, structure: 0.28, metadata: 0.2, timing: 0.15 },
  },
  "instagram@v1": {
    id: "instagram",
    version: "instagram@v1",
    platform: "instagram",
    label: "Instagram feed",
    hookWindowSeconds: 3,
    focus:
      "Score for IG feed/carousel: cover image stop-scroll power, caption storytelling, hashtag strategy, and save-worthiness.",
    weights: { hook: 0.24, visual: 0.28, structure: 0.16, metadata: 0.2, timing: 0.12 },
  },
};

export function resolveScoringProfile(
  platform: string,
  contentType?: string,
): ScoringProfile {
  const p = (platform || "youtube").toLowerCase();
  const isShort =
    contentType === "short" ||
    contentType === "reel" ||
    contentType === "shorts";

  switch (p) {
    case "tiktok":
      return SCORING_PROFILES["tiktok@v1"]!;
    case "twitter":
    case "x":
      return SCORING_PROFILES["x@v1"]!;
    case "linkedin":
      return SCORING_PROFILES["linkedin@v1"]!;
    case "instagram":
    case "instagram_reels":
    case "reels":
      return isShort || p.includes("reel")
        ? SCORING_PROFILES["instagram_reels@v1"]!
        : SCORING_PROFILES["instagram@v1"]!;
    case "youtube_shorts":
    case "shorts":
      return SCORING_PROFILES["youtube_shorts@v1"]!;
    case "youtube":
      return isShort
        ? SCORING_PROFILES["youtube_shorts@v1"]!
        : SCORING_PROFILES["youtube@v1"]!;
    default: {
      return SCORING_PROFILES["youtube@v1"]!;
    }
  }
}

export function listScoringProfiles(): ScoringProfile[] {
  return Object.values(SCORING_PROFILES);
}
