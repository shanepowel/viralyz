import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { SanityImage } from "@/components/media/SanityImage";
import { ScoreRing } from "@/components/score/ScoreRing";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Num } from "@/components/ui/Num";
import { Section } from "@/components/ui/Section";
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
  title: "Blog",
  description:
    "Teardowns of viral videos, honest pricing data, and lessons from scored posts.",
  path: routes.blog,
});

const PAGE_SIZE = 9;

type PostCard = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  score?: number | null;
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

  // Fallback to placeholder data until Sanity is seeded
  let list = posts ?? [];
  let total = count ?? 0;
  let cats = categories ?? [];
  if (!posts) {
    const placeholders = await listPosts({ category });
    list = placeholders.map((p) => ({
      _id: p._id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      publishedAt: p.publishedAt,
      score: p.scoreBadge ? Number.parseInt(p.scoreBadge, 10) || null : null,
      category: p.category,
      readingTime: p.readMinutes,
      coverImage: null,
    }));
    total = list.length;
    cats = BLOG_CATEGORIES;
  }

  const featured = !category && page === 1 ? list.find((p) => p.featured) ?? list[0] : null;
  const grid = featured ? list.filter((p) => p._id !== featured._id) : list;
  const categoryTitle =
    cats.find((c) => c.slug === category)?.title ?? category;

  return (
    <MarketingShell>
      <Section className="pt-20 md:pt-28 pb-8">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: routes.home },
              { label: "Blog" },
            ]}
          />
          <Eyebrow className="mt-6">Blog</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            What the scores are telling us.
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-secondary">
            Teardowns of viral videos and honest pricing data.
          </p>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          {featured ? (
            <Link href={`/blog/${featured.slug}`} className="mb-12 block">
              <Card hoverable className="overflow-hidden p-0">
                <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="relative min-h-56 bg-sunken">
                    {featured.coverImage ? (
                      <SanityImage
                        value={featured.coverImage as never}
                        width={1200}
                        height={675}
                        priority
                        className="h-full [&_img]:h-full [&_img]:object-cover"
                        sizes="(max-width: 1024px) 100vw, 60vw"
                      />
                    ) : (
                      <div className="flex h-full min-h-56 items-center justify-center bg-accent-soft" />
                    )}
                    {typeof featured.score === "number" ? (
                      <div className="absolute bottom-3 right-3 rounded-full bg-raised/90 p-1 shadow-sm">
                        <ScoreRing
                          value={featured.score}
                          size={56}
                          animate={false}
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-col justify-center p-6 md:p-8">
                    <p className="text-sm text-ink-tertiary">
                      {featured.category?.title ?? "Post"}
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl">
                      {featured.title}
                    </h2>
                    <p className="mt-3 text-ink-secondary leading-relaxed">
                      {featured.excerpt}
                    </p>
                    <p className="mt-4 text-sm text-ink-tertiary">
                      {featured.author?.name ? `${featured.author.name} · ` : ""}
                      {formatPostDate(featured.publishedAt)}
                      {featured.readingTime
                        ? ` · ${featured.readingTime} min`
                        : ""}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ) : null}

          <div className="mb-8 flex flex-wrap gap-2" aria-label="Categories">
            <Link
              href="/blog"
              className={cn(
                "rounded-sm px-3 py-2 text-sm transition-colors",
                !category
                  ? "bg-sunken font-medium text-ink"
                  : "text-ink-secondary hover:bg-sunken hover:text-ink",
              )}
            >
              All
            </Link>
            {cats.map((c) => (
              <Link
                key={c.slug}
                href={`/blog?category=${c.slug}`}
                className={cn(
                  "rounded-sm px-3 py-2 text-sm transition-colors",
                  category === c.slug
                    ? "bg-sunken font-medium text-ink"
                    : "text-ink-secondary hover:bg-sunken hover:text-ink",
                )}
              >
                {c.title}
              </Link>
            ))}
          </div>

          {grid.length === 0 ? (
            <EmptyState
              heading={`Nothing in ${categoryTitle} yet.`}
              body="We publish teardowns and playbooks as we score more content."
              action={{ href: routes.blog, label: "View all posts" }}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {grid.map((post) => (
                <Link key={post._id} href={`/blog/${post.slug}`}>
                  <Card hoverable className="h-full overflow-hidden p-0">
                    <div className="relative aspect-video overflow-hidden bg-sunken">
                      {post.coverImage ? (
                        <SanityImage
                          value={post.coverImage as never}
                          width={800}
                          height={450}
                          className="transition-transform duration-[var(--dur-med)] ease-out motion-safe:group-hover:scale-105 [&_img]:h-full [&_img]:object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : null}
                      {typeof post.score === "number" ? (
                        <div className="absolute bottom-2 right-2 rounded-full bg-raised/90 p-0.5 shadow-sm">
                          <ScoreRing
                            value={post.score}
                            size={40}
                            animate={false}
                          />
                        </div>
                      ) : null}
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-ink-tertiary">
                        {post.category?.title}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-ink line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-secondary">
                        {post.excerpt}
                      </p>
                      <p className="mt-3 text-sm text-ink-tertiary">
                        {formatPostDate(post.publishedAt)}
                        {post.readingTime ? (
                          <>
                            {" "}
                            · <Num>{post.readingTime}</Num> min
                          </>
                        ) : null}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {total > PAGE_SIZE ? (
            <div className="mt-10 flex justify-center gap-3">
              {page > 1 ? (
                <Link
                  href={`/blog?${category ? `category=${category}&` : ""}page=${page - 1}`}
                  className="text-sm text-accent underline underline-offset-4"
                >
                  Previous
                </Link>
              ) : null}
              {start + PAGE_SIZE < total ? (
                <Link
                  href={`/blog?${category ? `category=${category}&` : ""}page=${page + 1}`}
                  className="text-sm text-accent underline underline-offset-4"
                >
                  Next
                </Link>
              ) : null}
            </div>
          ) : null}
        </Container>
      </Section>
    </MarketingShell>
  );
}
