import type { Metadata } from "next";
import Link from "next/link";
import { LinkScorer } from "@/components/marketing/link-scorer";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { ScoreRing } from "@/components/score/ScoreRing";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Num } from "@/components/ui/Num";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  BLOG_CATEGORIES,
  formatPostDate,
  listPosts,
} from "@/lib/blog";
import { cn } from "@/lib/cn";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Blog",
  description:
    "Teardowns of viral videos, honest pricing data, and lessons from scored posts.",
  path: routes.blog,
});

function scoreFromBadge(badge?: string | null): number | null {
  if (!badge) return null;
  const n = Number.parseInt(badge, 10);
  return Number.isFinite(n) ? n : null;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const posts = await listPosts({ category });
  const categoryTitle =
    BLOG_CATEGORIES.find((c) => c.slug === category)?.title ?? category;

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
          <div
            className="mb-8 flex flex-wrap gap-2"
            role="tablist"
            aria-label="Categories"
          >
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
            {BLOG_CATEGORIES.map((c) => (
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

          {posts.length === 0 ? (
            <EmptyState
              heading={`Nothing in ${categoryTitle} yet.`}
              body="We publish teardowns and playbooks as we score more content."
              action={{ href: routes.blog, label: "View all posts" }}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {posts.map((post) => {
                const score = scoreFromBadge(post.scoreBadge);
                return (
                  <Link key={post._id} href={`/blog/${post.slug}`}>
                    <Card hoverable className="h-full overflow-hidden p-0">
                      <div
                        className="relative flex h-40 items-end justify-between p-4"
                        style={{ background: post.coverGradient }}
                      >
                        {score != null ? (
                          <ScoreRing
                            value={score}
                            size={48}
                            animate={false}
                            label={`Score ${score}`}
                          />
                        ) : post.scoreBadge ? (
                          <span className="rounded-sm bg-black/35 px-2 py-1 font-mono text-sm text-white">
                            {post.scoreBadge}
                          </span>
                        ) : (
                          <span />
                        )}
                      </div>
                      <div className="p-5">
                        <p className="text-sm text-ink-tertiary">
                          {post.category.title}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-ink">
                          {post.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                          {post.excerpt}
                        </p>
                        <p className="mt-3 text-sm text-ink-tertiary">
                          {formatPostDate(post.publishedAt)} ·{" "}
                          <Num>{post.readMinutes}</Num> min read
                        </p>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          {!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ? (
            <p className="mt-10 text-center text-sm text-ink-tertiary">
              Showing launch brief posts. Connect Sanity (
              <code className="font-mono">NEXT_PUBLIC_SANITY_PROJECT_ID</code>)
              to publish live.
            </p>
          ) : null}

          <div className="mt-16">
            <SectionHeader
              eyebrow="Try it"
              title="Score a link from anything you just read."
            />
            <div className="mt-6">
              <LinkScorer />
            </div>
          </div>
        </Container>
      </Section>
    </MarketingShell>
  );
}
