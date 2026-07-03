import type { LintFlag } from "@shared/schema";

const BANNED_WORDS = [
  "kill", "kys", "suicide", "rape", "n-word", "r*tard", "retard",
  "scam", "guaranteed", "miracle cure", "get rich quick",
];

const AI_TELLS = [
  "in today's fast-paced world",
  "delve into",
  "navigate the complexities",
  "in conclusion,",
  "it's important to note",
  "as an ai",
  "tapestry of",
  "leverage",
  "moreover,",
  "furthermore,",
  "in the realm of",
];

const PLATFORM_LIMITS: Record<string, { max: number; sweetSpot: [number, number] }> = {
  twitter: { max: 280, sweetSpot: [120, 240] },
  x: { max: 280, sweetSpot: [120, 240] },
  threads: { max: 500, sweetSpot: [150, 400] },
  linkedin: { max: 3000, sweetSpot: [600, 1500] },
  instagram: { max: 2200, sweetSpot: [200, 1200] },
  tiktok: { max: 2200, sweetSpot: [80, 300] },
  youtube: { max: 5000, sweetSpot: [200, 1500] },
  reels: { max: 2200, sweetSpot: [80, 300] },
  shorts: { max: 5000, sweetSpot: [80, 300] },
};

const PLATFORM_HASHTAG_TARGETS: Record<string, [number, number]> = {
  twitter: [0, 2],
  x: [0, 2],
  threads: [0, 3],
  linkedin: [2, 5],
  instagram: [5, 15],
  tiktok: [3, 6],
  youtube: [3, 8],
  reels: [3, 8],
  shorts: [3, 6],
};

function fleschReadingEase(text: string): number {
  const words = text.match(/\b\w+\b/g) ?? [];
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (!words.length || !sentences.length) return 60;
  const syllables = words.reduce((acc, w) => acc + Math.max(1, (w.toLowerCase().match(/[aeiouy]+/g) ?? []).length), 0);
  return 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
}

export function lintCaption(text: string, platform: string, hashtags: string[] = []): LintFlag[] {
  const flags: LintFlag[] = [];
  const plat = (platform || "").toLowerCase();
  const lower = text.toLowerCase();

  for (const w of BANNED_WORDS) {
    if (lower.includes(w)) {
      flags.push({ level: "error", category: "banned", message: `Risky word detected: "${w}"` });
    }
  }

  const limits = PLATFORM_LIMITS[plat];
  if (limits) {
    if (text.length > limits.max) {
      flags.push({
        level: "error",
        category: "length",
        message: `Too long for ${platform} (${text.length}/${limits.max} chars).`,
      });
    } else if (text.length > limits.sweetSpot[1]) {
      flags.push({
        level: "warn",
        category: "length",
        message: `Above ${platform} sweet spot (${text.length} > ${limits.sweetSpot[1]} chars).`,
      });
    } else if (text.length < limits.sweetSpot[0]) {
      flags.push({
        level: "info",
        category: "length",
        message: `Short for ${platform} (${text.length} chars). Consider expanding.`,
      });
    }
  }

  const hashtagTargets = PLATFORM_HASHTAG_TARGETS[plat];
  if (hashtagTargets) {
    const [min, max] = hashtagTargets;
    const count = hashtags.length;
    if (count > max) {
      flags.push({
        level: "warn",
        category: "hashtags",
        message: `${count} hashtags is more than ${platform} prefers (${min}-${max}).`,
      });
    } else if (count < min) {
      flags.push({
        level: "info",
        category: "hashtags",
        message: `${platform} typically uses ${min}-${max} hashtags. You have ${count}.`,
      });
    }
  }

  let aiTellHits = 0;
  for (const t of AI_TELLS) {
    if (lower.includes(t)) aiTellHits++;
  }
  if (aiTellHits >= 2) {
    flags.push({
      level: "warn",
      category: "ai-tells",
      message: `Sounds AI-written (${aiTellHits} cliché phrases). Rewrite the openers.`,
    });
  } else if (aiTellHits === 1) {
    flags.push({
      level: "info",
      category: "ai-tells",
      message: "Contains a common AI cliché. Consider replacing it.",
    });
  }

  const ease = fleschReadingEase(text);
  if (ease < 40) {
    flags.push({
      level: "warn",
      category: "readability",
      message: `Hard to read (Flesch ${Math.round(ease)}). Shorten sentences.`,
    });
  } else if (ease < 60) {
    flags.push({
      level: "info",
      category: "readability",
      message: `Moderate reading level (Flesch ${Math.round(ease)}).`,
    });
  }

  return flags;
}
