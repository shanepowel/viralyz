export type KitPackage = {
  id: string;
  name: string;
  description: string;
  deliveryDays: number;
  priceCents: number;
  currency: "GBP";
  usageRights: string;
};

export type PublicKit = {
  handle: string;
  displayName: string;
  initials: string;
  face: string;
  niche: string;
  bio: string;
  verified: boolean;
  followers: string;
  engagement: string;
  score: number;
  scoreDelta: string;
  predictionsRight: string;
  city?: string;
  packages: KitPackage[];
  tags: string[];
};

/** Demo kits for public browse / kit pages until live kits publish. */
export const PUBLIC_KITS: PublicKit[] = [
  {
    handle: "mayacooks",
    displayName: "Maya R.",
    initials: "MR",
    face: "linear-gradient(135deg,#F2994A,#EB5757)",
    niche: "Food",
    bio: "Weeknight recipes that actually get cooked. Verified food creator on Viralyz.",
    verified: true,
    followers: "214K",
    engagement: "7.4%",
    score: 89,
    scoreDelta: "▲ +11",
    predictionsRight: "88%",
    city: "London",
    tags: ["Food", "Under £250", "London"],
    packages: [
      {
        id: "maya-tiktok",
        name: "1 TikTok video",
        description: "Posted to my account. Recipe or product demo, 30 to 45 seconds.",
        deliveryDays: 7,
        priceCents: 18000,
        currency: "GBP",
        usageRights: "Organic post only. No paid ads.",
      },
      {
        id: "maya-reel-story",
        name: "Reel + Story bundle",
        description: "One Reel plus three Stories with a swipe-up style link sticker.",
        deliveryDays: 10,
        priceCents: 24000,
        currency: "GBP",
        usageRights: "Organic. 30-day brand reuse of stills.",
      },
      {
        id: "maya-ugc",
        name: "UGC video with usage",
        description: "Raw vertical file delivered to you. You post it.",
        deliveryDays: 14,
        priceCents: 32000,
        currency: "GBP",
        usageRights: "Paid ads and organic for 90 days.",
      },
    ],
  },
  {
    handle: "amaraglow",
    displayName: "Amara D.",
    initials: "AD",
    face: "linear-gradient(135deg,#56CCF2,#2F80ED)",
    niche: "Beauty",
    bio: "Clean beauty routines and honest reviews. Score track record brands can check.",
    verified: true,
    followers: "1.2M",
    engagement: "4.1%",
    score: 94,
    scoreDelta: "▲ +4",
    predictionsRight: "91%",
    tags: ["Beauty"],
    packages: [
      {
        id: "amara-reel",
        name: "1 Instagram Reel",
        description: "Product integration in a routine Reel on my feed.",
        deliveryDays: 14,
        priceCents: 95000,
        currency: "GBP",
        usageRights: "Organic. Paid boost by brand with approval.",
      },
      {
        id: "amara-ugc",
        name: "UGC set (3 videos)",
        description: "Three vertical cuts for your channels.",
        deliveryDays: 21,
        priceCents: 140000,
        currency: "GBP",
        usageRights: "Full paid usage for 6 months.",
      },
    ],
  },
  {
    handle: "sambuilds",
    displayName: "Sam K.",
    initials: "SK",
    face: "linear-gradient(135deg,#27AE60,#145A32)",
    niche: "Tech",
    bio: "Gadgets, workflows, and builder tips with receipts.",
    verified: true,
    followers: "340K",
    engagement: "5.2%",
    score: 74,
    scoreDelta: "▲ +6",
    predictionsRight: "79%",
    tags: ["Tech"],
    packages: [
      {
        id: "sam-yt",
        name: "YouTube Short",
        description: "One Short featuring your product in a real workflow.",
        deliveryDays: 10,
        priceCents: 42000,
        currency: "GBP",
        usageRights: "Organic. Clips for ads with 30-day window.",
      },
    ],
  },
  {
    handle: "jordanlifts",
    displayName: "Jordan T.",
    initials: "JT",
    face: "linear-gradient(135deg,#6C4CF1,#3D2A9E)",
    niche: "Fitness",
    bio: "Training that fits a busy week. Rising on TikTok with verified scores.",
    verified: true,
    followers: "88K",
    engagement: "9.1%",
    score: 81,
    scoreDelta: "▲ +9",
    predictionsRight: "84%",
    tags: ["Fitness", "Rising on TikTok", "Under £250"],
    packages: [
      {
        id: "jordan-tiktok",
        name: "1 TikTok video",
        description: "Posted to my account. Form tip or product in-use.",
        deliveryDays: 7,
        priceCents: 12000,
        currency: "GBP",
        usageRights: "Organic only.",
      },
      {
        id: "jordan-ugc",
        name: "UGC workout clip",
        description: "File delivered for your ads.",
        deliveryDays: 10,
        priceCents: 18000,
        currency: "GBP",
        usageRights: "Paid usage 60 days.",
      },
    ],
  },
  {
    handle: "lenamakes",
    displayName: "Lena P.",
    initials: "LP",
    face: "linear-gradient(135deg,#F857A6,#FF5858)",
    niche: "UGC",
    bio: "UGC specialist. Brands get files, not just posts.",
    verified: true,
    followers: "46K",
    engagement: "8.6%",
    score: 86,
    scoreDelta: "▲ +7",
    predictionsRight: "87%",
    city: "London",
    tags: ["UGC", "Under £250", "London"],
    packages: [
      {
        id: "lena-ugc",
        name: "1 UGC video",
        description: "Vertical ad-style video, raw file delivered.",
        deliveryDays: 7,
        priceCents: 9500,
        currency: "GBP",
        usageRights: "Paid + organic, 90 days.",
      },
    ],
  },
  {
    handle: "omargames",
    displayName: "Omar B.",
    initials: "OB",
    face: "linear-gradient(135deg,#8E2DE2,#4A00E0)",
    niche: "Gaming",
    bio: "Gameplay, reviews, and launch-day coverage.",
    verified: true,
    followers: "520K",
    engagement: "3.8%",
    score: 78,
    scoreDelta: "▲ +3",
    predictionsRight: "81%",
    tags: ["Rising on TikTok"],
    packages: [
      {
        id: "omar-yt",
        name: "Gameplay integration",
        description: "Your title featured in a Short or mid-roll style clip.",
        deliveryDays: 14,
        priceCents: 60000,
        currency: "GBP",
        usageRights: "Organic. Trailer stills for 30 days.",
      },
    ],
  },
  {
    handle: "niawanders",
    displayName: "Nia F.",
    initials: "NF",
    face: "linear-gradient(135deg,#11998E,#38EF7D)",
    niche: "Travel",
    bio: "City guides and stay reviews with real booking proof.",
    verified: true,
    followers: "156K",
    engagement: "6.0%",
    score: 83,
    scoreDelta: "▲ +5",
    predictionsRight: "85%",
    city: "London",
    tags: ["Under £250", "London"],
    packages: [
      {
        id: "nia-reel",
        name: "Stay Reel",
        description: "One Reel from a stay or destination you book.",
        deliveryDays: 14,
        priceCents: 24000,
        currency: "GBP",
        usageRights: "Organic + hotel site for 60 days.",
      },
    ],
  },
  {
    handle: "chrisfits",
    displayName: "Chris W.",
    initials: "CW",
    face: "linear-gradient(135deg,#FC4A1A,#F7B733)",
    niche: "Fashion",
    bio: "Everyday style with clear product callouts.",
    verified: true,
    followers: "92K",
    engagement: "5.5%",
    score: 71,
    scoreDelta: "▲ +2",
    predictionsRight: "76%",
    tags: ["Under £250"],
    packages: [
      {
        id: "chris-tiktok",
        name: "1 TikTok try-on",
        description: "Outfit try-on posted to my account.",
        deliveryDays: 7,
        priceCents: 15000,
        currency: "GBP",
        usageRights: "Organic only.",
      },
    ],
  },
];

export function getKitByHandle(handle: string): PublicKit | null {
  const h = handle.replace(/^@/, "").toLowerCase();
  return PUBLIC_KITS.find((k) => k.handle === h) ?? null;
}

export function formatGbp(cents: number) {
  return `£${(cents / 100).toLocaleString("en-GB", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Brand pays 10% on top; creator keeps 100% of listed price. */
export function brandFeeCents(priceCents: number) {
  return Math.round(priceCents * 0.1);
}

export function brandTotalCents(priceCents: number) {
  return priceCents + brandFeeCents(priceCents);
}
