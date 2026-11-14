import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { stegaClean } from "@sanity/client/stega";
import { FinalCtaBand } from "@/components/marketing/final-cta-band";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PortableBody } from "@/components/media/PortableBody";
import { SanityImage } from "@/components/media/SanityImage";
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
    // A note that ships with the site (no Sanity document for this slug).
    return (
      <MarketingShell>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: fallback.title,
            description: fallback.excerpt,
            datePublished: fallback.publishedAt,
            author: { "@type": "Organization", name: "Viralyz" },
            mainEntityOfPage: `${SITE_URL}/blog/${fallback.slug}`,
          }}
        />
        <Container className="pb-20 pt-[clamp(40px,6vw,80px)]">
          <article>
            <p className="m-0 mb-4 font-mono text-[12px] text-muted">
              <Link href={routes.blog} className="underline underline-offset-4 hover:text-ink">
                Notes
              </Link>{" "}
              / {fallback.category.title}
            </p>
            <h1 className="m-0 max-w-[900px] font-display text-[clamp(34px,5vw,60px)] text-balance">
              {fallback.title}
            </h1>
            <p className="m-0 mt-5 max-w-[680px] text-[19px] text-ink-2">{fallback.excerpt}</p>
            <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-4 border-t border-rule pt-6 md:grid-cols-[200px_1fr]">
              <p className="m-0 font-mono text-[12px] text-muted">
                {formatPostDate(fallback.publishedAt)}
                <span className="block">{fallback.readMinutes} min read</span>
                <span className="block">{fallback.author?.name ?? "Viralyz"}</span>
              </p>
              <div className="max-w-[680px] text-[18px] leading-[1.6]">
                {fallback.bodyHtml.map((p, i) => (
                  <p key={p.slice(0, 24)} className={i === 0 ? "m-0" : "m-0 mt-5"}>
                    {p}
                  </p>
                ))}
                <p className="m-0 mt-10 border-t border-line pt-4 text-[15px]">
                  <Link href={routes.blog} className="font-semibold underline underline-offset-4">
                    All notes
                  </Link>
                </p>
              </div>
            </div>
          </article>
        </Container>
        <FinalCtaBand
          title="Check your next ad before it costs you."
          subtitle="10 free credits. One credit makes and checks one ad."
          cta="Start free"
        />
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
              <p className="mt-4 text-base leading-relaxed text-muted">
                {post.excerpt}
              </p>
              <p className="mt-3 text-sm text-muted">
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
              <div className="mt-10 overflow-hidden rounded-card">
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

            <div className="mt-10 max-w-prose">
              <PortableBody value={post.body} />
            </div>

            <div className="mt-12 max-w-prose rounded-inner border border-line bg-card p-5">
              <p className="text-sm font-medium text-ink">
                {post.author?.name ?? "Viralyz Team"}
              </p>
              <p className="mt-1 text-sm text-muted">
                {post.author?.bio ??
                  "Notes from building and checking ad creative."}
              </p>
            </div>

            <p className="mt-10">
              <Link
                href={routes.blog}
                className="text-sm text-ink underline underline-offset-4"
              >
                All notes
              </Link>
            </p>
          </article>
        </Container>
      </Section>
      <FinalCtaBand
        title="Check your next ad before it costs you."
        subtitle="10 free credits on signup. No card required."
        cta="Start free"
      />
    </MarketingShell>
  );
}
