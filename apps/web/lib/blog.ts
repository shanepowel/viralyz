export type BlogCategory = {
  title: string;
  slug: string;
};

export type BlogPostCard = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  scoreBadge?: string | null;
  coverGradient: string;
  category: BlogCategory;
  readMinutes: number;
};

export type BlogPost = BlogPostCard & {
  author?: { name: string; role?: string } | null;
  bodyHtml: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
};

/** Placeholder posts matching the marketing mock until Sanity is connected. */
export const PLACEHOLDER_POSTS: BlogPost[] = [
  {
    _id: "placeholder-1",
    title: "Why that 40 second kitchen video hit 12 million views",
    slug: "kitchen-video-12-million-views",
    excerpt:
      "We ran the score. The opening did almost all of the work. Here is the breakdown.",
    publishedAt: "2026-07-08T09:00:00.000Z",
    scoreBadge: "94",
    coverGradient: "linear-gradient(135deg,#6C4CF1,#3D2A9E)",
    category: { title: "Teardowns", slug: "teardowns" },
    readMinutes: 5,
    author: { name: "Viralyz", role: "Editorial" },
    bodyHtml: [
      "Most viral food clips do not win on recipes. They win on the first three seconds.",
      "We scored the kitchen video that crossed 12 million views. Opening landed at 19 out of 20. Visuals and pacing were strong, but the hook carried almost the entire lift.",
      "The first line stated the outcome before the method. That pattern shows up again and again in our scored set for food creators.",
    ],
    seoTitle: "Kitchen video teardown: how a 40s clip hit 12M views",
    seoDescription:
      "A Viral Score teardown of a 40 second kitchen video that reached 12 million views.",
  },
  {
    _id: "placeholder-2",
    title: "What creators actually charge in 2026, by niche and platform",
    slug: "creator-pricing-2026",
    excerpt:
      "Real numbers from verified media kits. No guesswork, no inflated rate cards.",
    publishedAt: "2026-07-01T09:00:00.000Z",
    scoreBadge: "£",
    coverGradient: "linear-gradient(135deg,#F2994A,#EB5757)",
    category: { title: "Pricing", slug: "pricing" },
    readMinutes: 7,
    author: { name: "Viralyz", role: "Editorial" },
    bodyHtml: [
      "Rate cards online are often fantasy. Verified kits tell a quieter story.",
      "Across niches, mid-tier TikTok packages cluster lower than Instagram Reels with usage rights. UGC delivered as files, not posts, prices differently again.",
      "When packages ship on Viralyz, this guide will update from real bookings, not surveys alone.",
    ],
  },
  {
    _id: "placeholder-3",
    title: "The three fixes that move scores most, ranked by real results",
    slug: "three-fixes-that-move-scores",
    excerpt:
      "We looked at every fix applied this year. These three earned their points.",
    publishedAt: "2026-06-24T09:00:00.000Z",
    scoreBadge: "+12",
    coverGradient: "linear-gradient(135deg,#27AE60,#145A32)",
    category: { title: "Playbooks", slug: "playbooks" },
    readMinutes: 6,
    author: { name: "Viralyz", role: "Editorial" },
    bodyHtml: [
      "Not every suggestion moves the needle. Three do, consistently.",
      "Rewrite the opening line. Cut the still shot that bleeds past four seconds. Put the payoff earlier than you think you should.",
      "Those three show the largest average score lift after re-score in our early data.",
    ],
  },
  {
    _id: "placeholder-4",
    title: "Packages are here: sell fixed price offers from your media kit",
    slug: "packages-on-media-kits",
    excerpt:
      "List an offer, get paid safely, keep 100%. Here is how it works.",
    publishedAt: "2026-06-17T09:00:00.000Z",
    scoreBadge: "▲",
    coverGradient: "linear-gradient(135deg,#56CCF2,#2F80ED)",
    category: { title: "Product news", slug: "product-news" },
    readMinutes: 3,
    author: { name: "Viralyz", role: "Product" },
    bodyHtml: [
      "Creators can list up to three fixed offers on their media kit: price, delivery time, and what the brand gets.",
      "Brands pay upfront. Funds sit with Viralyz until delivery and approval. Creators keep 100%. Buyers pay a 10% fee on top.",
      "This is marketplace revenue without waiting for full campaigns.",
    ],
  },
];

export const BLOG_CATEGORIES: BlogCategory[] = [
  { title: "Teardowns", slug: "teardowns" },
  { title: "Pricing", slug: "pricing" },
  { title: "Playbooks", slug: "playbooks" },
  { title: "Product news", slug: "product-news" },
];

export function formatPostDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function listPosts(opts?: {
  category?: string;
  start?: number;
  end?: number;
}): Promise<BlogPostCard[]> {
  const start = opts?.start ?? 0;
  const end = opts?.end ?? 12;
  let posts = PLACEHOLDER_POSTS;
  if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    try {
      const { fetchPostsFromSanity } = await import("./sanity-posts");
      const remote = await fetchPostsFromSanity();
      if (remote.length) posts = remote;
    } catch {
      // keep placeholders
    }
  }
  const filtered = opts?.category
    ? posts.filter((p) => p.category.slug === opts.category)
    : posts;
  return filtered.slice(start, end);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    try {
      const { fetchPostBySlugFromSanity } = await import("./sanity-posts");
      const remote = await fetchPostBySlugFromSanity(slug);
      if (remote) return remote;
    } catch {
      // fall through
    }
  }
  return PLACEHOLDER_POSTS.find((p) => p.slug === slug) ?? null;
}
