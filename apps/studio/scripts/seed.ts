import { createClient } from "@sanity/client";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "jnxqbr4r";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";
const token =
  process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN;

if (!token) {
  console.error("SANITY_API_WRITE_TOKEN is required to seed");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-02-01",
  token,
  useCdn: false,
});

function blocks(text: string) {
  return text.split(/\n\n+/).map((para, i) => ({
    _type: "block" as const,
    _key: `b${i}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `s${i}`, text: para, marks: [] }],
  }));
}

async function uploadSolidCover(filename: string, color: string) {
  // Minimal valid 8x8 PNG (precomputed) + we'll just use SVG as image
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color}"/>
      <stop offset="100%" stop-color="#1A1D23"/>
    </linearGradient></defs>
    <rect width="1600" height="900" fill="url(#g)"/>
    <text x="80" y="820" fill="white" font-family="sans-serif" font-size="48" opacity="0.7">Viralyz</text>
  </svg>`;
  const asset = await client.assets.upload(
    "image",
    Buffer.from(svg),
    { filename, contentType: "image/svg+xml" },
  );
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
    alt: "Editorial cover image",
  };
}

async function upsert(doc: Record<string, unknown> & { _id: string; _type: string }) {
  await client.createOrReplace(doc);
  console.log("upserted", doc._type, doc._id);
}

async function main() {
  await upsert({
    _id: "siteSettings",
    _type: "siteSettings",
    siteName: "Viralyz",
    missionLine:
      "Score your content before you post it. Build a record brands can trust.",
    companyNumber: "16095214",
    companyLocation: "Windsor, UK",
    parentCompany: "Digiteq Holdings Limited",
    helloEmail: "hello@viralyz.com",
    partnershipsEmail: "partnerships@viralyz.com",
  });

  await upsert({
    _id: "author-viralyz-team",
    _type: "author",
    name: "Viralyz Team",
    role: "Editorial",
    bio: "Notes from scoring real creator content.",
  });

  const cats = [
    { id: "category-teardowns", title: "Teardowns", slug: "teardowns", accentTone: "score" },
    { id: "category-pricing", title: "Pricing", slug: "pricing", accentTone: "neutral" },
    { id: "category-playbooks", title: "Playbooks", slug: "playbooks", accentTone: "neutral" },
    { id: "category-product-news", title: "Product news", slug: "product-news", accentTone: "neutral" },
  ];
  for (const c of cats) {
    await upsert({
      _id: c.id,
      _type: "category",
      title: c.title,
      slug: { _type: "slug", current: c.slug },
      accentTone: c.accentTone,
    });
  }

  const cover1 = await uploadSolidCover("kitchen-cover.svg", "#6C4CF1");
  const cover2 = await uploadSolidCover("pricing-cover.svg", "#F2994A");
  const cover3 = await uploadSolidCover("fixes-cover.svg", "#27AE60");
  const cover4 = await uploadSolidCover("packages-cover.svg", "#2F80ED");

  await upsert({
    _id: "post-kitchen-video",
    _type: "post",
    title: "Why that 40 second kitchen video hit 12 million views",
    slug: { _type: "slug", current: "kitchen-video-12-million-views" },
    excerpt:
      "We ran the score. The opening did almost all of the work. Here is the breakdown.",
    category: { _type: "reference", _ref: "category-teardowns" },
    author: { _type: "reference", _ref: "author-viralyz-team" },
    publishedAt: "2026-07-08T09:00:00.000Z",
    featured: true,
    coverImage: cover1,
    score: 94,
    body: [
      ...blocks(
        "Most viral food clips do not win on recipes. They win on the first three seconds.\n\nWe scored the kitchen video that crossed 12 million views. Opening landed at 19 out of 20. Visuals and pacing were strong, but the hook carried almost the entire lift.",
      ),
      {
        _type: "scoreBreakdown",
        _key: "sb1",
        items: [
          { _key: "i1", factor: "Hook", score: 95 },
          { _key: "i2", factor: "Visuals", score: 88 },
          { _key: "i3", factor: "Pacing", score: 90 },
          { _key: "i4", factor: "Words", score: 86 },
        ],
      },
      ...blocks(
        "The first line stated the outcome before the method. That pattern shows up again and again in our scored set for food creators.",
      ),
    ],
    seoTitle: "Kitchen video teardown: how a 40s clip hit 12M views",
    seoDescription:
      "A Viral Score teardown of a 40 second kitchen video that reached 12 million views.",
  });

  await upsert({
    _id: "post-creator-pricing",
    _type: "post",
    title: "What creators actually charge in 2026, by niche and platform",
    slug: { _type: "slug", current: "creator-pricing-2026" },
    excerpt:
      "Real numbers from verified media kits. No guesswork, no inflated rate cards.",
    category: { _type: "reference", _ref: "category-pricing" },
    author: { _type: "reference", _ref: "author-viralyz-team" },
    publishedAt: "2026-07-01T09:00:00.000Z",
    coverImage: cover2,
    body: blocks(
      "Rate cards online are often fantasy. Verified kits tell a quieter story.\n\nAcross niches, mid-tier TikTok packages cluster lower than Instagram Reels with usage rights. UGC delivered as files, not posts, prices differently again.\n\nWhen packages ship on Viralyz, this guide will update from real bookings, not surveys alone.",
    ),
  });

  await upsert({
    _id: "post-three-fixes",
    _type: "post",
    title: "The three fixes that move scores most, ranked by real results",
    slug: { _type: "slug", current: "three-fixes-that-move-scores" },
    excerpt:
      "We looked at every fix applied this year. These three earned their points.",
    category: { _type: "reference", _ref: "category-playbooks" },
    author: { _type: "reference", _ref: "author-viralyz-team" },
    publishedAt: "2026-06-24T09:00:00.000Z",
    coverImage: cover3,
    body: blocks(
      "Not every suggestion moves the needle. Three do, consistently.\n\nRewrite the opening line. Cut the still shot that bleeds past four seconds. Put the payoff earlier than you think you should.\n\nThose three show the largest average score lift after re-score in our early data.",
    ),
  });

  await upsert({
    _id: "post-packages",
    _type: "post",
    title: "Packages are here: sell fixed price offers from your media kit",
    slug: { _type: "slug", current: "packages-on-media-kits" },
    excerpt:
      "List an offer, get paid safely, keep 100%. Here is how it works.",
    category: { _type: "reference", _ref: "category-product-news" },
    author: { _type: "reference", _ref: "author-viralyz-team" },
    publishedAt: "2026-06-17T09:00:00.000Z",
    coverImage: cover4,
    body: blocks(
      "Creators can list up to three fixed offers on their media kit: price, delivery time, and what the brand gets.\n\nBrands pay upfront. Funds sit with Viralyz until delivery and approval. Creators keep 100%. Buyers pay a 10% fee on top.\n\nThis is marketplace revenue without waiting for full campaigns.",
    ),
  });

  const features = [
    {
      id: "feature-viral-score",
      slug: "viral-score",
      name: "Viral Score",
      group: "Score",
      icon: "gauge",
      order: 1,
      tagline: "Know how your content will do. Before you post it.",
      summary:
        "Every post gets a score out of 100 across five areas: opening, visuals, pacing, words and timing.",
      bullets: [
        "Score in under 30 seconds from a file or a link",
        "Five factor breakdown with a fix for each weak area",
        "Rescore after each fix and watch the number move",
      ],
      appHref: "https://app.viralyz.com/analyze",
      live: true,
    },
    {
      id: "feature-hook-lab",
      slug: "hook-lab",
      name: "Hook Lab",
      group: "Create",
      icon: "sparkles",
      order: 2,
      tagline: "Ten opening lines for any idea, ranked.",
      summary:
        "Your first three seconds decide everything. Hook Lab gives you ten opening lines for any idea.",
      bullets: [
        "Ten ranked openings per idea",
        "Plain-language notes on why each line works or fails",
        "Pick one, paste it into Script Doctor, and keep scoring",
      ],
      appHref: "https://app.viralyz.com/hook-lab",
      live: true,
    },
    {
      id: "feature-script-doctor",
      slug: "script-doctor",
      name: "Script Doctor",
      group: "Create",
      icon: "clapperboard",
      order: 3,
      tagline: "Line-by-line script feedback, with a teleprompter built in.",
      summary:
        "Paste your script and get feedback line by line: weak opening, buried point, missing call to action.",
      bullets: [
        "Line-by-line notes with suggested rewrites",
        "Teleprompter mode for recording",
        "Captions and hashtags as part of the same rewrite pass",
      ],
      appHref: "https://app.viralyz.com/caption-studio",
      live: true,
    },
    {
      id: "feature-thumbnail-studio",
      slug: "thumbnail-studio",
      name: "Thumbnail Studio",
      group: "Publish",
      icon: "image",
      order: 4,
      tagline: "See your thumbnail at real feed size.",
      summary:
        "See your thumbnail at real feed size, sitting next to typical competitor tiles.",
      bullets: [
        "Feed-size previews for YouTube, TikTok, and Instagram",
        "Side-by-side comparison against typical tiles",
        "Clear readability checks before you publish",
      ],
      appHref: "https://app.viralyz.com/thumbnails",
      live: true,
    },
    {
      id: "feature-performance-tracking",
      slug: "performance-tracking",
      name: "Performance Tracking",
      group: "Intel",
      icon: "line-chart",
      order: 5,
      tagline: "Predicted versus actual, over time.",
      summary:
        "After you post, we track what really happened against the prediction, and publish our accuracy on your profile.",
      bullets: [
        "Predicted score versus real outcomes",
        "Accuracy published on your profile when we have enough data",
        "Niche trend context so you post into rising formats",
      ],
      appHref: "https://app.viralyz.com/trends",
      live: true,
    },
  ];

  for (const f of features) {
    const shot = await uploadSolidCover(`${f.slug}-shot.svg`, "#4F46E5");
    await upsert({
      _id: f.id,
      _type: "feature",
      name: f.name,
      slug: { _type: "slug", current: f.slug },
      group: f.group,
      tagline: f.tagline,
      summary: f.summary,
      icon: f.icon,
      bullets: f.bullets,
      appHref: f.appHref,
      order: f.order,
      live: f.live,
      screenshot: { ...shot, alt: `${f.name} product screenshot placeholder` },
    });
  }

  await upsert({
    _id: "cta-start-free",
    _type: "ctaBand",
    heading: "Score your next video",
    body: "Ten free scores a month. No card required.",
    primaryLabel: "Score your video, free",
    primaryHref: "https://app.viralyz.com",
    secondaryLabel: "Browse creators",
    secondaryHref: "/creators",
  });

  const faqs = [
    {
      id: "faq-brands-pay",
      q: "Do brands pay to search creators?",
      a: "Brands can browse profiles for free. A subscription unlocks the campaign manager and, at launch, direct booking with escrow.",
      audience: "general",
    },
    {
      id: "faq-score-calc",
      q: "How is a score calculated?",
      a: "We analyze opening, visuals, pacing, words and timing against what performs in your niche, then combine them into a score out of 100.",
      audience: "general",
    },
    {
      id: "faq-cancel",
      q: "Can I cancel anytime?",
      a: "Yes. Plans are month to month with no lock-in. Your public profile stays live on the free tier.",
      audience: "creator",
    },
  ];
  for (const f of faqs) {
    await upsert({
      _id: f.id,
      _type: "faqItem",
      question: f.q,
      answer: blocks(f.a),
      audience: f.audience,
    });
  }

  for (const legal of [
    {
      id: "legal-privacy",
      title: "Privacy policy",
      slug: "privacy",
      body: "Viralyz is operated by Digiteq Holdings Limited. We process account data, connected platform metrics, and content you upload to score.\n\nYou can export or delete your data from settings. Contact hello@viralyz.com for privacy requests.",
    },
    {
      id: "legal-terms",
      title: "Terms of service",
      slug: "terms",
      body: "By using Viralyz you agree to these terms. The service is provided as-is while we grow the product.\n\nDo not misuse platform APIs or attempt to scrape other users' private data.",
    },
    {
      id: "legal-cookies",
      title: "Cookies",
      slug: "cookies",
      body: "We use Plausible Analytics, which is cookieless. Essential cookies keep you signed in on the product app.\n\nIf we ever add optional marketing pixels, they load only after you opt in.",
    },
  ]) {
    await upsert({
      _id: legal.id,
      _type: "legalPage",
      title: legal.title,
      slug: { _type: "slug", current: legal.slug },
      lastUpdated: "2026-07-01",
      body: blocks(legal.body),
    });
  }

  await upsert({
    _id: "homePage",
    _type: "page",
    title: "Home",
    slug: { _type: "slug", current: "home" },
    pageBuilder: [
      {
        _type: "hero",
        _key: "hero",
        eyebrow: "Viralyz",
        heading: "Know how your content will do. Before you post it.",
        lede: "Score every video out of 100, see the fixes worth the most points, and build a track record brands can trust.",
        primaryCta: {
          label: "Score your video, free",
          href: "https://app.viralyz.com",
        },
        secondaryCta: { label: "Browse creators", href: "/creators" },
        mediaKind: "scoreDemo",
      },
      {
        _type: "statsBand",
        _key: "stats",
        items: [
          { _key: "s1", value: "100", label: "Point score on every video" },
          { _key: "s2", value: "5", label: "Areas analyzed per post" },
          { _key: "s3", value: "<30s", label: "To your first score" },
          { _key: "s4", value: "10", label: "Free scores a month" },
        ],
      },
      {
        _type: "ctaSection",
        _key: "cta",
        band: { _type: "reference", _ref: "cta-start-free" },
      },
    ],
  });

  await upsert({
    _id: "aboutPage",
    _type: "page",
    title: "About",
    slug: { _type: "slug", current: "about" },
    pageBuilder: [
      {
        _type: "hero",
        _key: "h",
        eyebrow: "About",
        heading: "Creators deserve to know, not guess.",
        lede: "Viralyz exists because posting content should not feel like a lottery ticket.",
        mediaKind: "none",
      },
      {
        _type: "richText",
        _key: "r",
        body: blocks(
          "Millions of people make content every day. Most of them post it and hope. Viralyz makes the fixable problems visible — score before you post, explain what is wrong in plain language, and show what each fix is worth.\n\nViralyz is a Digiteq Holdings Limited company (16095214), built from Windsor, UK.",
        ),
      },
      {
        _type: "ctaSection",
        _key: "c",
        band: { _type: "reference", _ref: "cta-start-free" },
      },
    ],
  });

  console.log("Seed complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
