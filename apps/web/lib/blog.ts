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

/** Built-in posts, shown until Sanity has published posts of its own. */
export const PLACEHOLDER_POSTS: BlogPost[] = [
  {
    _id: "placeholder-1",
    title: "Viralyz is now a creative studio for online sellers",
    slug: "viralyz-seller-creative-studio",
    excerpt:
      "Find ads that keep running, make on-brand variants for your product, check them before you spend, and learn from your own results.",
    publishedAt: "2026-10-22T09:00:00.000Z",
    scoreBadge: null,
    coverGradient: "linear-gradient(135deg,#6C4CF1,#3D2A9E)",
    category: { title: "Product news", slug: "product-news" },
    readMinutes: 3,
    author: { name: "Viralyz", role: "Product" },
    bodyHtml: [
      "Viralyz started as a scoring tool for creators. We've rebuilt it around one job: helping online sellers make better ad creative, faster, without pretending to know more than we do.",
      "The product is a loop with five stages. Discover finds ads that advertisers have kept paying for, from the Meta Ad Library (EU and UK) and TikTok's Commercial Content Library. Brand kit imports your product page so every variant starts from facts you've confirmed. Studio writes copy for your product from a reference's structure and generates the image. Pre-flight checks each variant against the placement's published specs. Results imports what really happened and tells you how far to trust the checks.",
      "The creator pages, media kits and creator tools have been retired. Their old links now point to the closest page on the new site.",
    ],
    seoTitle: "Viralyz is now a creative studio for online sellers",
    seoDescription:
      "Viralyz has been rebuilt as an ad creative studio for online sellers: Discover, Brand kit, Studio, Pre-flight checks and Results.",
  },
  {
    _id: "placeholder-2",
    title: "Days running is a signal, not proof",
    slug: "days-running-is-a-signal",
    excerpt:
      "Why we show how long an ad has run instead of calling it a winner, and what that number can and can't tell you.",
    publishedAt: "2026-10-22T09:00:00.000Z",
    scoreBadge: null,
    coverGradient: "linear-gradient(135deg,#F2994A,#EB5757)",
    category: { title: "Playbooks", slug: "playbooks" },
    readMinutes: 4,
    author: { name: "Viralyz", role: "Editorial" },
    bodyHtml: [
      "Official ad libraries don't publish sales, spend per ad or click-through rate for commercial ads. What they do publish is when an ad started running and whether it's still live.",
      "An advertiser who keeps paying for the same ad for weeks is usually seeing a return on it. That makes days running a useful filter. It isn't proof: big brands sometimes leave ads running out of inertia, and a short-lived ad may simply have been a test.",
      "So Discover shows the numbers we can measure, days running and how many variants the advertiser made, and never labels an ad a winner. Use them to choose which structures to borrow, then let your own results decide.",
    ],
  },
  {
    _id: "placeholder-3",
    title: "Why your pre-flight score is sometimes blank",
    slug: "why-pre-flight-score-is-blank",
    excerpt:
      "A score built on two checks looks just as precise as one built on ten. We'd rather show nothing.",
    publishedAt: "2026-10-22T09:00:00.000Z",
    scoreBadge: null,
    coverGradient: "linear-gradient(135deg,#27AE60,#145A32)",
    category: { title: "Playbooks", slug: "playbooks" },
    readMinutes: 3,
    author: { name: "Viralyz", role: "Product" },
    bodyHtml: [
      "Each variant is checked for text contrast, text area, safe-zone overlap, aspect ratio, copy length and restricted claims. Some checks can't always run: if there's no text layer, there's no contrast to measure.",
      "The headline score is the share of checks that passed, and it only appears once at least four checks have actually run. Below that, a single pass or fail would swing the number wildly, so we leave it blank and show the individual checks instead.",
      "The AI-assessed hook-clarity note is shown separately and never counts toward the score. It will only be folded in if your own results show it tracks real click-through rate.",
    ],
  },
];

export const BLOG_CATEGORIES: BlogCategory[] = [
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
