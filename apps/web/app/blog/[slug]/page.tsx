import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { stegaClean } from "@sanity/client/stega";
import { FinalCtaBand } from "@/components/marketing/final-cta-band";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PortableBody } from "@/components/media/PortableBody";
import { SanityImage } from "@/components/media/SanityImage";
import { ScoreRing } from "@/components/score/ScoreRing";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Num } from "@/components/ui/Num";
import { Section } from "@/components/ui/Section";
import { formatPostDate, getPostBySlug, PLACEHOLDER_POSTS } from "@/lib/blog";
import { pageMeta } from "@/lib/meta";
import { routes, SITE_URL } from "@/lib/site";
import { cleanSlug, fetchSanity } from "@/sanity/lib/fetch";
import { POST_QUERY, POST_SLUGS_QUERY } from "@/sanity/lib/queries";

export async function generateStaticParams() {
  const slugs = await fetchSanity<{ slug: string }[]>({
    query: POST_SLUGS_QUERY,
    published: true,
    stega: false,
  });
  if (slugs?.length) return slugs.map((s) => ({ slug: cleanSlug(s.slug) }));
  return PLACEHOLDER_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchSanity<{
    title?: string;
    excerpt?: string;
    seoTitle?: string;
    seoDescription?: string;
    publishedAt?: string;
    score?: number;
    coverImage?: { asset?: { url?: string } };
  }>({
    query: POST_QUERY,
    params: { slug: stegaClean(slug) },
    published: true,
    stega: false,
  });

  if (!post) {
    const fallback = await getPostBySlug(slug);
    if (!fallback) return { title: "Post" };
    return pageMeta({
      title: fallback.seoTitle || fallback.title,
      description: fallback.seoDescription || fallback.excerpt,
      path: `/blog/${fallback.slug}`,
      article: { publishedTime: fallback.publishedAt },
    });
  }

  const ogImage = post.coverImage?.asset?.url
    ? post.coverImage.asset.url
    : `/og?title=${encodeURIComponent(post.title ?? "")}${
        typeof post.score === "number" ? `&score=${post.score}` : ""
      }`;

  return pageMeta({
    title: post.seoTitle || post.title || "Post",
    description: post.seoDescription || post.excerpt || "",
    path: `/blog/${slug}`,
    ogImage,
    article: { publishedTime: post.publishedAt },
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: raw } = await params;
  const slug = stegaClean(raw);

  const post = await fetchSanity<{
    title: string;
    slug: string;
    excerpt: string;
    publishedAt: string;
    score?: number | null;
    category?: { title?: string; slug?: string } | null;
    author?: { name?: string; role?: string; bio?: string; avatar?: unknown } | null;
    coverImage?: unknown;
    body?: unknown;
    readingTime?: number | null;
  }>({
    query: POST_QUERY,
    params: { slug },
  });

  if (!post) {
    const fallback = await getPostBySlug(slug);
    if (!fallback) notFound();
    // Legacy placeholder render path
    return (
      <MarketingShell>
        <Section className="pt-20 md:pt-28">
          <Container>
            <article className="max-w-2xl">
              <Eyebrow>{fallback.category.title}</Eyebrow>
              <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
                {fallback.title}
              </h1>
              <div className="prose-vz mt-8">
                {fallback.bodyHtml.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
            </article>
          </Container>
        </Section>
      </MarketingShell>
    );
  }

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
          <article>
            <div className="max-w-2xl">
              <Breadcrumbs
                items={[
                  { label: "Home", href: routes.home },
                  { label: "Blog", href: routes.blog },
                  { label: post.title },
                ]}
              />
              <Eyebrow className="mt-6">
                {post.category?.title ?? "Post"}
              </Eyebrow>
              <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                {post.title}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-ink-secondary">
                {post.excerpt}
              </p>
              <p className="mt-3 text-sm text-ink-tertiary">
                {formatPostDate(post.publishedAt)}
                {post.readingTime ? (
                  <>
                    {" "}
                    · <Num>{post.readingTime}</Num> min read
                  </>
                ) : null}
                {post.author?.name ? ` · ${post.author.name}` : " · Viralyz Team"}
              </p>
            </div>

            {post.coverImage ? (
              <div className="mt-10 overflow-hidden rounded-lg">
                <SanityImage
                  value={post.coverImage as never}
                  width={1600}
                  height={900}
                  priority
                  sizes="100vw"
                  className="w-full"
                />
              </div>
            ) : null}

            {typeof post.score === "number" ? (
              <div className="mt-8">
                <ScoreRing value={post.score} size={96} />
              </div>
            ) : null}

            <div className="mt-10 max-w-prose">
              <PortableBody value={post.body} />
            </div>

            <div className="mt-12 max-w-prose rounded-md border border-line bg-raised p-5 shadow-sm">
              <p className="text-sm font-medium text-ink">
                {post.author?.name ?? "Viralyz Team"}
              </p>
              <p className="mt-1 text-sm text-ink-secondary">
                {post.author?.bio ??
                  "Editorial notes from scoring real creator content."}
              </p>
            </div>

            <p className="mt-10">
              <Link
                href={routes.blog}
                className="text-sm text-accent underline underline-offset-4"
              >
                ← All posts
              </Link>
            </p>
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
