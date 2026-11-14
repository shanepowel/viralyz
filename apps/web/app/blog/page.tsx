import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/cn";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";
import { cleanSlug, fetchSanity } from "@/sanity/lib/fetch";
import {
  CATEGORIES_QUERY,
  POSTS_COUNT_QUERY,
  POSTS_QUERY,
} from "@/sanity/lib/queries";
import { listPosts, BLOG_CATEGORIES, formatPostDate } from "@/lib/blog";

export const metadata: Metadata = pageMeta({
  title: "Notes",
  description:
    "Ad creative that survives spend: checks, teardowns and what the data says.",
  path: routes.blog,
});

const PAGE_SIZE = 9;

type PostCard = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  featured?: boolean | null;
  category?: { title?: string; slug?: string } | null;
  author?: { name?: string; avatar?: unknown } | null;
  coverImage?: unknown;
  readingTime?: number | null;
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category: rawCategory, page: pageRaw } = await searchParams;
  const category = rawCategory ? cleanSlug(rawCategory) : undefined;
  const page = Math.max(1, Number(pageRaw ?? "1") || 1);
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const [posts, count, categories] = await Promise.all([
    fetchSanity<PostCard[]>({
      query: POSTS_QUERY,
      params: { category: category ?? null, start, end },
    }),
    fetchSanity<number>({
      query: POSTS_COUNT_QUERY,
      params: { category: category ?? null },
    }),
    fetchSanity<{ title: string; slug: string }[]>({
      query: CATEGORIES_QUERY,
    }),
  ]);

  // The notes that ship with the site stand in whenever Sanity has nothing
  // published (an empty dataset) or cannot be reached.
  let list = posts ?? [];
  let total = count ?? 0;
  let cats = categories ?? [];
  if (!posts || (posts.length === 0 && !category && page === 1)) {
    const placeholders = await listPosts({ category });
    list = placeholders.map((p) => ({
      _id: p._id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      publishedAt: p.publishedAt,
      category: p.category,
      readingTime: p.readMinutes,
      coverImage: null,
    }));
    total = list.length;
    cats = BLOG_CATEGORIES;
  }

  const categoryTitle = cats.find((c) => c.slug === category)?.title;
  const tab = (on: boolean) =>
    cn(
      "inline-flex min-h-11 items-center border-b-2 px-0.5 text-[15px]",
      on ? "border-ink font-semibold text-ink" : "border-transparent text-muted hover:text-ink",
    );

  return (
    <MarketingShell>
      <Container className="pb-20 pt-[clamp(40px,6vw,80px)]">
        <SectionHeader
          as="h1"
          eyebrow="Notes"
          title="Ad creative that survives spend"
          lede="Checks, teardowns and what the data says. Written for people who pay for their own ads."
        />

        <nav aria-label="Categories" className="flex flex-wrap gap-x-6 border-b border-rule">
          <Link href="/blog" aria-current={!category ? "page" : undefined} className={tab(!category)}>
            All
          </Link>
          {cats.map((c) => (
            <Link
              key={c.slug}
              href={`/blog?category=${c.slug}`}
              aria-current={category === c.slug ? "page" : undefined}
              className={tab(category === c.slug)}
            >
              {c.title}
            </Link>
          ))}
        </nav>

        {list.length === 0 ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-2 border-b border-line py-10 md:grid-cols-[200px_1fr]">
            <p className="kicker m-0 pt-1.5">Nothing here yet</p>
            <div>
              <p className="m-0 font-display text-[26px]">
                {categoryTitle ? `No notes in ${categoryTitle} yet.` : "No notes yet."}
              </p>
              <Link href="/blog" className="mt-3 inline-block font-semibold underline underline-offset-4">
                See all notes
              </Link>
            </div>
          </div>
        ) : (
          <ol className="m-0 list-none p-0">
            {list.map((post) => (
              <li key={post._id} className="border-b border-line">
                <Link
                  href={`/blog/${post.slug}`}
                  className="group grid grid-cols-1 gap-x-8 gap-y-2 py-7 md:grid-cols-[200px_1fr]"
                >
                  <p className="m-0 pt-1.5 font-mono text-[12px] text-muted">
                    {formatPostDate(post.publishedAt)}
                    {post.category?.title ? <span className="block uppercase tracking-[0.06em]">{post.category.title}</span> : null}
                  </p>
                  <div className="max-w-[760px]">
                    <h2 className="m-0 font-display text-[clamp(24px,3vw,34px)] text-balance group-hover:underline group-hover:underline-offset-4">
                      {post.title}
                    </h2>
                    <p className="m-0 mt-2.5 text-ink-2">{post.excerpt}</p>
                    {post.readingTime ? (
                      <p className="m-0 mt-2 font-mono text-[12px] text-muted">{post.readingTime} min read</p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}

        {total > PAGE_SIZE ? (
          <div className="mt-8 flex gap-6">
            {page > 1 ? (
              <Link
                href={`/blog?${category ? `category=${category}&` : ""}page=${page - 1}`}
                className="font-semibold underline underline-offset-4"
              >
                Newer
              </Link>
            ) : null}
            {start + PAGE_SIZE < total ? (
              <Link
                href={`/blog?${category ? `category=${category}&` : ""}page=${page + 1}`}
                className="font-semibold underline underline-offset-4"
              >
                Older
              </Link>
            ) : null}
          </div>
        ) : null}
      </Container>
    </MarketingShell>
  );
}
