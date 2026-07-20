export type CreatorNiche =
  | "Food"
  | "Beauty"
  | "Fitness"
  | "Tech"
  | "Travel"
  | "Gaming"
  | "UGC"
  | "Fashion";

export type CreatorPlatform = "TikTok" | "Instagram" | "YouTube" | "X";

export type Creator = {
  slug: string;
  name: string;
  handle: string;
  niche: CreatorNiche;
  platform: CreatorPlatform;
  followers: number;
  engagementPct: number;
  score: number;
  avgViews: number;
  demo: true;
  bio: string;
  city?: string;
  face: string;
  suggestedRateGbp: number;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const creators: Creator[] = [
  {
    slug: "mayacooks",
    name: "Maya R.",
    handle: "@mayacooks",
    niche: "Food",
    platform: "TikTok",
    followers: 214_000,
    engagementPct: 7.4,
    score: 89,
    avgViews: 412_000,
    demo: true,
    bio: "Weeknight recipes that actually get cooked.",
    city: "London",
    face: "linear-gradient(135deg,#F2994A,#EB5757)",
    suggestedRateGbp: 650,
  },
  {
    slug: "amaraglow",
    name: "Amara D.",
    handle: "@amaraglow",
    niche: "Beauty",
    platform: "YouTube",
    followers: 1_200_000,
    engagementPct: 4.1,
    score: 94,
    avgViews: 890_000,
    demo: true,
    bio: "Clean beauty routines and honest reviews.",
    face: "linear-gradient(135deg,#56CCF2,#2F80ED)",
    suggestedRateGbp: 2400,
  },
  {
    slug: "sambuilds",
    name: "Sam K.",
    handle: "@sambuilds",
    niche: "Tech",
    platform: "X",
    followers: 340_000,
    engagementPct: 5.2,
    score: 74,
    avgViews: 120_000,
    demo: true,
    bio: "Gadgets, workflows, and builder tips with receipts.",
    face: "linear-gradient(135deg,#27AE60,#145A32)",
    suggestedRateGbp: 900,
  },
  {
    slug: "jordanlifts",
    name: "Jordan T.",
    handle: "@jordanlifts",
    niche: "Fitness",
    platform: "Instagram",
    followers: 88_000,
    engagementPct: 9.1,
    score: 81,
    avgViews: 64_000,
    demo: true,
    bio: "Training that fits a busy week.",
    face: "linear-gradient(135deg,#6C4CF1,#3D2A9E)",
    suggestedRateGbp: 420,
  },
  {
    slug: "lenamakes",
    name: "Lena P.",
    handle: "@lenamakes",
    niche: "UGC",
    platform: "Instagram",
    followers: 46_000,
    engagementPct: 8.6,
    score: 86,
    avgViews: 38_000,
    demo: true,
    bio: "UGC specialist. Brands get files, not just posts.",
    city: "London",
    face: "linear-gradient(135deg,#F857A6,#FF5858)",
    suggestedRateGbp: 350,
  },
  {
    slug: "omargames",
    name: "Omar B.",
    handle: "@omargames",
    niche: "Gaming",
    platform: "YouTube",
    followers: 520_000,
    engagementPct: 3.8,
    score: 78,
    avgViews: 260_000,
    demo: true,
    bio: "Gameplay, reviews, and launch-day coverage.",
    face: "linear-gradient(135deg,#8E2DE2,#4A00E0)",
    suggestedRateGbp: 1100,
  },
  {
    slug: "niawanders",
    name: "Nia F.",
    handle: "@niawanders",
    niche: "Travel",
    platform: "TikTok",
    followers: 156_000,
    engagementPct: 6.0,
    score: 83,
    avgViews: 98_000,
    demo: true,
    bio: "City guides and stay reviews with real booking proof.",
    city: "London",
    face: "linear-gradient(135deg,#11998E,#38EF7D)",
    suggestedRateGbp: 550,
  },
  {
    slug: "chrisfits",
    name: "Chris W.",
    handle: "@chrisfits",
    niche: "Fashion",
    platform: "Instagram",
    followers: 92_000,
    engagementPct: 5.5,
    score: 71,
    avgViews: 47_000,
    demo: true,
    bio: "Everyday style with clear product callouts.",
    face: "linear-gradient(135deg,#FC4A1A,#F7B733)",
    suggestedRateGbp: 480,
  },
];

export const getCreator = (slug: string) =>
  creators.find((c) => c.slug === slug.replace(/^@/, "").toLowerCase());

export const byNiche = (niche: string) =>
  creators.filter((c) => c.niche.toLowerCase() === niche.toLowerCase());

export function formatFollowers(n: number) {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export function formatViews(n: number) {
  return formatFollowers(n);
}

export function creatorInitials(c: Creator) {
  return initials(c.name);
}

export const CREATOR_NICHES = [
  "Food",
  "Beauty",
  "Fitness",
  "Tech",
  "Travel",
  "Gaming",
  "UGC",
  "Fashion",
] as const satisfies readonly CreatorNiche[];
