import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FinalCtaBand } from "@/components/marketing/final-cta-band";
import { LinkScorer } from "@/components/marketing/link-scorer";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { ScoreRing } from "@/components/score/ScoreRing";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Num } from "@/components/ui/Num";
import { Section } from "@/components/ui/Section";
import {
  formatPostDate,
  getPostBySlug,
  PLACEHOLDER_POSTS,
} from "@/lib/blog";
import { pageMeta } from "@/lib/meta";
import { routes, SITE_URL } from "@/lib/site";

export async function generateStaticParams() {
  return PLACEHOLDER_POSTS.map((p) => ({ slug: p.slug }));
}

function scoreFromBadge(badge?: string | null): number | null {
  if (!badge) return null;
  const n = Number.parseInt(badge, 10);
  return Number.isFinite(n) ? n : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post" };
  const score = scoreFromBadge(post.scoreBadge);
  const ogImage = `/og?title=${encodeURIComponent(post.title)}${
    score != null ? `&score=${score}` : ""
  }`;
  return pageMeta({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    ogImage,
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

  const score = scoreFromBadge(post.scoreBadge);
  const idx = PLACEHOLDER_POSTS.findIndex((p) => p.slug === post.slug);
  const prev = idx > 0 ? PLACEHOLDER_POSTS[idx - 1] : null;
  const next =
    idx >= 0 && idx < PLACEHOLDER_POSTS.length - 1
      ? PLACEHOLDER_POSTS[idx + 1]
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: {
      "@type": "Organization",
      name: post.author?.name ?? "Viralyz Team",
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <MarketingShell>
      <JsonLd data={jsonLd} />
      <Section className="pt-20 md:pt-28 pb-8">
        <Container>
          <article className="max-w-2xl">
            <Breadcrumbs
              items={[
                { label: "Home", href: routes.home },
                { label: "Blog", href: routes.blog },
                { label: post.title },
              ]}
            />
            <Eyebrow className="mt-6">{post.category.title}</Eyebrow>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary">
              {post.excerpt}
            </p>
            <p className="mt-3 text-sm text-ink-tertiary">
              {formatPostDate(post.publishedAt)} ·{" "}
              <Num>{post.readMinutes}</Num> min read
              {post.author ? ` · ${post.author.name}` : " · Viralyz Team"}
            </p>

            {score != null ? (
              <div className="mt-8">
                <ScoreRing value={score} size={96} label={`Score ${score}`} />
              </div>
            ) : null}

            <div className="prose-vz mt-10">
              {post.bodyHtml.map((para) => (
                <p key={para.slice(0, 40)}>{para}</p>
              ))}
            </div>

            <div className="mt-12 rounded-md border border-line bg-raised p-5 shadow-sm">
              <p className="text-sm font-medium text-ink">Viralyz Team</p>
              <p className="mt-1 text-sm text-ink-secondary">
                Editorial notes from scoring real creator content.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap justify-between gap-4 text-sm">
              {prev ? (
                <Link
                  href={`/blog/${prev.slug}`}
                  className="text-accent underline underline-offset-4"
                >
                  ← {prev.title}
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={`/blog/${next.slug}`}
                  className="text-accent underline underline-offset-4"
                >
                  {next.title} →
                </Link>
              ) : null}
            </div>

            <div className="mt-14">
              <Eyebrow>Score it yourself</Eyebrow>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
                Paste a link. See the same kind of breakdown.
              </h2>
              <div className="mt-5">
                <LinkScorer />
              </div>
            </div>
          </article>
        </Container>
      </Section>
      <FinalCtaBand
        title="Score your next video"
        subtitle="Ten free scores a month. No card required."
        cta="Score your video, free"
      />
    </MarketingShell>
  );
}
