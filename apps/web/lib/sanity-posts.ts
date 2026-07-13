import type { BlogPost } from "./blog";

type SanityConfig = {
  projectId: string;
  dataset: string;
  token?: string;
};

function getConfig(): SanityConfig | null {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) return null;
  return {
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    token: process.env.SANITY_API_READ_TOKEN,
  };
}

async function groqFetch<T>(query: string, params?: Record<string, string>): Promise<T | null> {
  const cfg = getConfig();
  if (!cfg) return null;
  const url = new URL(
    `https://${cfg.projectId}.api.sanity.io/v2026-02-01/data/query/${cfg.dataset}`,
  );
  url.searchParams.set("query", query);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(`$${k}`, JSON.stringify(v));
    }
  }
  const res = await fetch(url.toString(), {
    headers: cfg.token ? { Authorization: `Bearer ${cfg.token}` } : undefined,
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { result: T };
  return json.result;
}

const POST_CARD = `{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  scoreBadge,
  "coverGradient": coalesce(coverImage.asset->url, ""),
  "category": category->{title, "slug": slug.current}
}`;

export async function fetchPostsFromSanity(): Promise<BlogPost[]> {
  const rows = await groqFetch<
    Array<{
      _id: string;
      title: string;
      slug: string;
      excerpt: string;
      publishedAt: string;
      scoreBadge?: string;
      coverGradient?: string;
      category: { title: string; slug: string };
    }>
  >(`*[_type == "post" && defined(slug.current)] | order(publishedAt desc) ${POST_CARD}`);
  if (!rows?.length) return [];
  return rows.map((r) => ({
    ...r,
    coverGradient: r.coverGradient
      ? `center / cover url(${r.coverGradient})`
      : "linear-gradient(135deg,#6C4CF1,#3D2A9E)",
    readMinutes: 5,
    bodyHtml: [],
  }));
}

export async function fetchPostBySlugFromSanity(
  slug: string,
): Promise<BlogPost | null> {
  const row = await groqFetch<{
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    publishedAt: string;
    scoreBadge?: string;
    coverGradient?: string;
    category: { title: string; slug: string };
    author?: { name: string; role?: string };
    seoTitle?: string;
    seoDescription?: string;
    body?: Array<{ _type: string; children?: Array<{ text?: string }> }>;
  } | null>(
    `*[_type == "post" && slug.current == $slug][0]{
      _id, title, "slug": slug.current, excerpt, publishedAt, scoreBadge,
      "coverGradient": coalesce(coverImage.asset->url, ""),
      "category": category->{title, "slug": slug.current},
      "author": author->{name, role},
      seoTitle, seoDescription,
      body
    }`,
    { slug },
  );
  if (!row) return null;
  const paragraphs =
    row.body
      ?.filter((b) => b._type === "block")
      .map((b) => (b.children || []).map((c) => c.text || "").join(""))
      .filter(Boolean) ?? [];
  return {
    _id: row._id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    publishedAt: row.publishedAt,
    scoreBadge: row.scoreBadge,
    coverGradient: row.coverGradient
      ? `center / cover url(${row.coverGradient})`
      : "linear-gradient(135deg,#6C4CF1,#3D2A9E)",
    category: row.category,
    readMinutes: Math.max(
      3,
      Math.ceil(paragraphs.join(" ").split(/\s+/).length / 200),
    ),
    author: row.author,
    bodyHtml: paragraphs,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
  };
}
