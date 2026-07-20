import type { Metadata } from "next";
import Link from "next/link";
import { LinkScorer } from "@/components/marketing/link-scorer";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import {
  BLOG_CATEGORIES,
  formatPostDate,
  listPosts,
} from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Teardowns of viral videos, honest pricing data, and lessons from scored posts.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const posts = await listPosts({ category });

  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <span className="eyebrow">Blog</span>
          <h1>What the scores are telling us.</h1>
          <p>
            Teardowns of viral videos, honest pricing data, and lessons from
            millions of scored posts.
          </p>
        </div>
      </div>
      <section style={{ paddingTop: 24, paddingBottom: 80 }}>
        <div className="wrap">
          <div className="blog-filters" role="tablist" aria-label="Categories">
            <Link
              href="/blog"
              className={`bchip${!category ? " active" : ""}`}
            >
              All
            </Link>
            {BLOG_CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/blog?category=${c.slug}`}
                className={`bchip${category === c.slug ? " active" : ""}`}
              >
                {c.title}
              </Link>
            ))}
          </div>
          <div className="blog-grid">
            {posts.map((post) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="bcard-post"
              >
                <div
                  className="bcard-img"
                  style={{ background: post.coverGradient }}
                >
                  {post.scoreBadge ? (
                    <span className="bcard-score">{post.scoreBadge}</span>
                  ) : null}
                </div>
                <div className="bcard-body">
                  <span className="bcard-tag">{post.category.title}</span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <span className="bcard-meta">
                    {formatPostDate(post.publishedAt)} · {post.readMinutes} min
                    read
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ? (
            <p
              style={{
                textAlign: "center",
                marginTop: 40,
                fontSize: 13,
                color: "var(--ink-3)",
              }}
            >
              Showing launch brief posts. Connect Sanity (
              <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code>) to publish live.
            </p>
          ) : null}
          <div style={{ marginTop: 64 }}>
            <div className="sec-head" style={{ marginBottom: 24 }}>
              <span className="eyebrow">Try it</span>
              <h2>Score a link from anything you just read.</h2>
            </div>
            <LinkScorer />
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
