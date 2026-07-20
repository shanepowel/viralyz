import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { formatPostDate, listPosts } from "@/lib/blog";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Changelog",
  description: "Product news and shipping notes from the Viralyz team.",
  path: routes.changelog,
});

export default async function ChangelogPage() {
  const posts = await listPosts({ category: "product-news" });

  return (
    <MarketingShell>
      <Section className="pt-20 md:pt-28">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: routes.home },
              { label: "Changelog" },
            ]}
          />
          <Eyebrow className="mt-6">Product</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Changelog
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-secondary">
            Dated notes from shipping. Same source as our product-news posts.
          </p>

          <div className="mt-12 max-w-2xl">
            {posts.length === 0 ? (
              <EmptyState
                heading="No product news yet"
                body="When we ship, entries appear here and in the blog."
                action={{ href: routes.blog, label: "View all posts" }}
              />
            ) : (
              <ol className="space-y-8 border-l border-line pl-6">
                {posts.map((post) => (
                  <li key={post._id} className="relative">
                    <span
                      className="absolute -left-[1.65rem] top-1.5 h-2.5 w-2.5 rounded-full bg-accent"
                      aria-hidden
                    />
                    <p className="text-sm text-ink-tertiary">
                      {formatPostDate(post.publishedAt)}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-ink">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="hover:text-accent"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                      {post.excerpt}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </Container>
      </Section>
    </MarketingShell>
  );
}
