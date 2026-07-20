import {
  creators,
  creatorInitials,
  formatFollowers,
  getCreator,
  type Creator,
} from "@/data/creators";
import { formatGbpCents } from "@/lib/currency";

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
  demo: true;
  followers: string;
  followersRaw: number;
  engagement: string;
  score: number;
  avgViews: string;
  suggestedRateGbp: number;
  city?: string;
  packages: KitPackage[];
  tags: string[];
  platform: string;
};

const PACKAGE_MAP: Record<string, KitPackage[]> = {
  mayacooks: [
    {
      id: "maya-tiktok",
      name: "1 TikTok video",
      description:
        "Posted to my account. Recipe or product demo, 30 to 45 seconds.",
      deliveryDays: 7,
      priceCents: 18000,
      currency: "GBP",
      usageRights: "Organic post only. No paid ads.",
    },
    {
      id: "maya-reel-story",
      name: "Reel + Story bundle",
      description:
        "One Reel plus three Stories with a swipe-up style link sticker.",
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
  amaraglow: [
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
  sambuilds: [
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
  jordanlifts: [
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
  lenamakes: [
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
  omargames: [
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
  niawanders: [
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
  chrisfits: [
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
};

function toKit(c: Creator): PublicKit {
  return {
    handle: c.slug,
    displayName: c.name,
    initials: creatorInitials(c),
    face: c.face,
    niche: c.niche,
    bio: c.bio,
    demo: true,
    followers: formatFollowers(c.followers),
    followersRaw: c.followers,
    engagement: `${c.engagementPct}%`,
    score: c.score,
    avgViews: formatFollowers(c.avgViews),
    suggestedRateGbp: c.suggestedRateGbp,
    city: c.city,
    packages: PACKAGE_MAP[c.slug] ?? [],
    tags: [c.niche, ...(c.city ? [c.city] : [])],
    platform: c.platform,
  };
}

export const PUBLIC_KITS: PublicKit[] = creators.map(toKit);

export function getKitByHandle(handle: string): PublicKit | null {
  const c = getCreator(handle);
  return c ? toKit(c) : null;
}

/** @deprecated Use formatGbpCents from @/lib/currency */
export function formatGbp(cents: number) {
  return formatGbpCents(cents);
}

export function brandFeeCents(priceCents: number) {
  return Math.round(priceCents * 0.1);
}

export function brandTotalCents(priceCents: number) {
  return priceCents + brandFeeCents(priceCents);
}
