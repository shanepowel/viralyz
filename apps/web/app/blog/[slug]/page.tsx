import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LinkScorer } from "@/components/marketing/link-scorer";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import {
  formatPostDate,
  getPostBySlug,
  PLACEHOLDER_POSTS,
} from "@/lib/blog";
import { pageMeta } from "@/lib/meta";
import { SITE_URL } from "@/lib/site";

export async function generateStaticParams() {
  return PLACEHOLDER_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post" };
  return pageMeta({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    article: { publishedTime: post.publishedAt },
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: post.author
      ? { "@type": "Person", name: post.author.name }
      : undefined,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="wrap" style={{ paddingBottom: 80 }}>
        <div className="page-hero" style={{ maxWidth: 720 }}>
          <span className="eyebrow">{post.category.title}</span>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <p style={{ fontSize: 13.5, color: "var(--ink-3)", marginTop: 12 }}>
            {formatPostDate(post.publishedAt)} · {post.readMinutes} min read
            {post.author ? ` · ${post.author.name}` : ""}
          </p>
        </div>
        <div
          className="bcard-img"
          style={{
            background: post.coverGradient,
            borderRadius: "var(--r-lg)",
            marginBottom: 36,
            maxWidth: 720,
          }}
        >
          {post.scoreBadge ? (
            <span className="bcard-score">{post.scoreBadge}</span>
          ) : null}
        </div>
        <div className="about-body" style={{ maxWidth: 680 }}>
          {post.bodyHtml.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </div>
        <div style={{ marginTop: 48, maxWidth: 560 }}>
          <div className="sec-head" style={{ marginBottom: 20 }}>
            <span className="eyebrow">Score it yourself</span>
            <h2>Paste a link. See the same kind of breakdown.</h2>
          </div>
          <LinkScorer />
        </div>
        <p style={{ marginTop: 40, fontSize: 13.5, color: "var(--ink-3)" }}>
          <Link href="/blog" style={{ color: "var(--violet-deep)" }}>
            ← All posts
          </Link>
        </p>
      </article>
    </MarketingShell>
  );
}
