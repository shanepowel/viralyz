/**
 * Seed public demo media kits + packages into Neon.
 *
 *   DATABASE_URL=… pnpm --filter @repo/db seed:kits
 */
import {
  createDb,
  ensureKitAndPackages,
  type SeedKit,
} from "@repo/db";

const KITS: SeedKit[] = [
  {
    id: "kit_mayacooks",
    userId: "demo_maya",
    slug: "mayacooks",
    verified: true,
    sections: {
      displayName: "Maya R.",
      niche: "Food",
      followers: "214K",
      score: 89,
    },
    packages: [
      {
        id: "maya-tiktok",
        name: "1 TikTok video",
        description:
          "Posted to my account. Recipe or product demo, 30 to 45 seconds.",
        deliveryDays: 7,
        priceCents: 18000,
        currency: "GBP",
        usageRights: "Organic post only. No paid ads.",
        sortOrder: 0,
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
        sortOrder: 1,
      },
      {
        id: "maya-ugc",
        name: "UGC video with usage",
        description: "Raw vertical file delivered to you. You post it.",
        deliveryDays: 14,
        priceCents: 32000,
        currency: "GBP",
        usageRights: "Paid ads and organic for 90 days.",
        sortOrder: 2,
      },
    ],
  },
  {
    id: "kit_amaraglow",
    userId: "demo_amara",
    slug: "amaraglow",
    verified: true,
    sections: { displayName: "Amara D.", niche: "Beauty", score: 94 },
    packages: [
      {
        id: "amara-reel",
        name: "1 Instagram Reel",
        description: "Product integration in a routine Reel on my feed.",
        deliveryDays: 14,
        priceCents: 95000,
        currency: "GBP",
        usageRights: "Organic. Paid boost by brand with approval.",
        sortOrder: 0,
      },
      {
        id: "amara-ugc",
        name: "UGC set (3 videos)",
        description: "Three vertical cuts for your channels.",
        deliveryDays: 21,
        priceCents: 140000,
        currency: "GBP",
        usageRights: "Full paid usage for 6 months.",
        sortOrder: 1,
      },
    ],
  },
  {
    id: "kit_sambuilds",
    userId: "demo_sam",
    slug: "sambuilds",
    verified: true,
    sections: { displayName: "Sam K.", niche: "Tech", score: 74 },
    packages: [
      {
        id: "sam-yt",
        name: "YouTube Short",
        description: "One Short featuring your product in a real workflow.",
        deliveryDays: 10,
        priceCents: 42000,
        currency: "GBP",
        usageRights: "Organic. Clips for ads with 30-day window.",
        sortOrder: 0,
      },
    ],
  },
  {
    id: "kit_jordanlifts",
    userId: "demo_jordan",
    slug: "jordanlifts",
    verified: true,
    sections: { displayName: "Jordan T.", niche: "Fitness", score: 81 },
    packages: [
      {
        id: "jordan-tiktok",
        name: "1 TikTok video",
        description: "Posted to my account. Form tip or product in-use.",
        deliveryDays: 7,
        priceCents: 12000,
        currency: "GBP",
        usageRights: "Organic only.",
        sortOrder: 0,
      },
      {
        id: "jordan-ugc",
        name: "UGC workout clip",
        description: "File delivered for your ads.",
        deliveryDays: 10,
        priceCents: 18000,
        currency: "GBP",
        usageRights: "Paid usage 60 days.",
        sortOrder: 1,
      },
    ],
  },
  {
    id: "kit_lenamakes",
    userId: "demo_lena",
    slug: "lenamakes",
    verified: true,
    sections: { displayName: "Lena P.", niche: "UGC", score: 86 },
    packages: [
      {
        id: "lena-ugc",
        name: "1 UGC video",
        description: "Vertical ad-style video, raw file delivered.",
        deliveryDays: 7,
        priceCents: 9500,
        currency: "GBP",
        usageRights: "Paid + organic, 90 days.",
        sortOrder: 0,
      },
    ],
  },
  {
    id: "kit_omargames",
    userId: "demo_omar",
    slug: "omargames",
    verified: true,
    sections: { displayName: "Omar B.", niche: "Gaming", score: 78 },
    packages: [
      {
        id: "omar-yt",
        name: "Gameplay integration",
        description: "Your title featured in a Short or mid-roll style clip.",
        deliveryDays: 14,
        priceCents: 60000,
        currency: "GBP",
        usageRights: "Organic. Trailer stills for 30 days.",
        sortOrder: 0,
      },
    ],
  },
  {
    id: "kit_niawanders",
    userId: "demo_nia",
    slug: "niawanders",
    verified: true,
    sections: { displayName: "Nia F.", niche: "Travel", score: 83 },
    packages: [
      {
        id: "nia-reel",
        name: "Stay Reel",
        description: "One Reel from a stay or destination you book.",
        deliveryDays: 14,
        priceCents: 24000,
        currency: "GBP",
        usageRights: "Organic + hotel site for 60 days.",
        sortOrder: 0,
      },
    ],
  },
  {
    id: "kit_chrisfits",
    userId: "demo_chris",
    slug: "chrisfits",
    verified: true,
    sections: { displayName: "Chris W.", niche: "Fashion", score: 71 },
    packages: [
      {
        id: "chris-tiktok",
        name: "1 TikTok try-on",
        description: "Outfit try-on posted to my account.",
        deliveryDays: 7,
        priceCents: 15000,
        currency: "GBP",
        usageRights: "Organic only.",
        sortOrder: 0,
      },
    ],
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }
  const db = createDb();
  for (const kit of KITS) {
    const id = await ensureKitAndPackages(db, kit);
    console.log(`seeded ${kit.slug} → ${id} (${kit.packages.length} packages)`);
  }
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
