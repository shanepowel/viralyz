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

/**
 * Notes that ship with the site, shown whenever Sanity has no published
 * posts (or cannot be reached). Written for sellers; the safe-zone and
 * limit figures match the app's placement specs.
 */
export const PLACEHOLDER_POSTS: BlogPost[] = [
  {
    _id: "note-safe-zones",
    title: "Why your Story button is invisible: safe zones by placement",
    slug: "safe-zones-by-placement",
    excerpt:
      "Stories, Reels and TikTok draw their own controls over the top and bottom of your ad. Here is how much room each one takes.",
    publishedAt: "2026-11-13T09:00:00.000Z",
    scoreBadge: null,
    coverGradient: "var(--vz-panel)",
    category: { title: "Checks", slug: "checks" },
    readMinutes: 4,
    author: { name: "Viralyz", role: "Product" },
    bodyHtml: [
      "A full-screen ad is never shown full screen. The platform draws a profile row across the top and a caption, reply bar or row of buttons across the bottom. Anything you put there is covered, and a covered button cannot be tapped.",
      "On a 1080 by 1920 pixel canvas, Meta Stories and Reels need roughly the top 250 pixels and the bottom 250 pixels kept clear, plus a small margin at each side. TikTok takes less at the top, about 150 pixels, and more at the bottom, about 320 pixels, because the caption, sound and engagement buttons all sit there.",
      "The most common failure we see is the call to action. Designers put the button near the bottom edge because that is where buttons go on a web page. On a Story it lands under the reply bar. The fix is nearly always the same: move it up until it is inside the safe zone and leave everything else alone.",
      "Feed placements are different. A 1:1 or 4:5 feed ad has no overlay, so there is no safe zone to respect. That is also why a design that works in the feed cannot simply be stretched to 9:16.",
      "You can check any 9:16 image against both sets of zones with the free safe-zone checker. In Viralyz the same check runs on every ad the moment it is made, and a breach is marked on the ad itself.",
    ],
    seoTitle: "Safe zones for Stories, Reels and TikTok ads",
    seoDescription:
      "How much of a 9:16 ad is covered by the platform's own controls on Meta Stories, Reels and TikTok, and how to keep your button visible.",
  },
  {
    _id: "note-contrast",
    title: "Contrast that survives a phone in daylight",
    slug: "contrast-on-a-phone-in-daylight",
    excerpt:
      "An ad that reads well on your monitor can vanish on a phone outdoors. One number tells you in advance.",
    publishedAt: "2026-11-13T09:00:00.000Z",
    scoreBadge: null,
    coverGradient: "var(--vz-panel)",
    category: { title: "Checks", slug: "checks" },
    readMinutes: 3,
    author: { name: "Viralyz", role: "Product" },
    bodyHtml: [
      "Ads are designed on large, bright screens in dim rooms and then seen on small screens in bright ones. Text that looked fine at your desk loses most of its contrast on a phone held in sunlight.",
      "Contrast ratio is the measure. It compares the lightness of the text with the lightness of what is behind it, from 1:1 for identical colours to 21:1 for black on white. The accessibility standard most teams use asks for at least 4.5:1 for normal text and 3:1 for large headlines.",
      "Brand palettes fail this more often than people expect. White text on a mid orange, or a pale brand colour on white, usually lands between 2:1 and 3:1. It looks elegant in the brand guidelines and unreadable in a feed.",
      "Three fixes cover most cases. Darken the text or the background until the ratio clears. Put a solid block of colour behind the text rather than laying it straight over a photograph. Or move the text to a calmer part of the image.",
      "The free ad readability checker gives you the ratio for any two colours and shows your ad at feed size. Viralyz measures it on every ad and marks the text that falls short.",
    ],
    seoTitle: "Ad text contrast: the 4.5:1 rule explained",
    seoDescription:
      "Why ad text disappears on phones outdoors, what contrast ratio measures, and how to fix low-contrast ad creative.",
  },
  {
    _id: "note-policy",
    title: "The claims that get ad creative rejected",
    slug: "claims-that-get-ads-rejected",
    excerpt:
      "Most rejected ads are not rejected for the picture. They are rejected for one sentence.",
    publishedAt: "2026-11-13T09:00:00.000Z",
    scoreBadge: null,
    coverGradient: "var(--vz-panel)",
    category: { title: "Policy", slug: "policy" },
    readMinutes: 4,
    author: { name: "Viralyz", role: "Product" },
    bodyHtml: [
      "Platform advertising rules are long, but a small number of wording patterns account for a large share of rejections. All of them are easy to write by accident when you are trying to be persuasive.",
      "Personal attributes. Copy that implies you know something about the reader, such as their health, finances or appearance, is restricted. \"Struggling with acne?\" addresses the reader's condition. \"A cleanser made for acne-prone skin\" describes the product. The second is the one that runs.",
      "Health and before-and-after claims. Promising a specific result in a specific time, or showing a before and after, is a common reason for rejection, especially for weight, skin and supplements. Describe what the product is and does, not what will happen to the buyer.",
      "Income claims. Stating or implying what someone will earn draws the same treatment. Describe the offer, not the outcome.",
      "Viralyz checks ad wording against these patterns and holds the download of any ad that trips one. It is guidance, not a guarantee of approval: the platforms make the final decision and their rules change. It does catch the sentence you would otherwise find out about after submitting.",
    ],
    seoTitle: "Ad policy: wording that gets Meta and TikTok ads rejected",
    seoDescription:
      "The wording patterns behind most ad rejections: personal attributes, health and before-and-after claims, and income claims.",
  },
];

export const BLOG_CATEGORIES: BlogCategory[] = [
  { title: "Checks", slug: "checks" },
  { title: "Policy", slug: "policy" },
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
