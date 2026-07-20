import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { stegaClean } from "@sanity/client/stega";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { MuxVideo } from "@/components/media/MuxVideo";
import { SanityImage } from "@/components/media/SanityImage";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buttonClasses } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { features as staticFeatures, getFeature } from "@/data/features";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";
import { cleanSlug, fetchSanity } from "@/sanity/lib/fetch";
import { FEATURE_QUERY, FEATURE_SLUGS_QUERY } from "@/sanity/lib/queries";

type Params = Promise<{ feature: string }>;

export async function generateStaticParams() {
  const slugs = await fetchSanity<{ slug: string }[]>({
    query: FEATURE_SLUGS_QUERY,
    published: true,
    stega: false,
  });
  if (slugs?.length) {
    return slugs.map((s) => ({ feature: cleanSlug(s.slug) }));
  }
  return staticFeatures.map((f) => ({ feature: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { feature } = await params;
  const slug = stegaClean(feature);
  const doc = await fetchSanity<{
    name?: string;
    tagline?: string;
    seoTitle?: string;
    seoDescription?: string;
  }>({
    query: FEATURE_QUERY,
    params: { slug },
    published: true,
    stega: false,
  });
  if (doc) {
    return pageMeta({
      title: doc.seoTitle || doc.name || "Feature",
      description: doc.seoDescription || doc.tagline || "",
      path: `/platform/${slug}`,
    });
  }
  const f = getFeature(slug);
  if (!f) return {};
  return pageMeta({
    title: f.name,
    description: f.tagline,
    path: `/platform/${f.slug}`,
  });
}

export default async function FeaturePage({ params }: { params: Params }) {
  const { feature } = await params;
  const slug = stegaClean(feature);

  const doc = await fetchSanity<{
    name: string;
    slug: string;
    tagline?: string;
    summary?: string;
    bullets?: string[];
    appHref?: string;
    screenshot?: unknown;
    demoPlaybackId?: string | null;
  }>({
    query: FEATURE_QUERY,
    params: { slug },
  });

  if (!doc) {
    const f = getFeature(slug);
    if (!f) notFound();
    return (
      <MarketingShell>
        <Section className="pt-20 md:pt-28">
          <Container>
            <Eyebrow>Platform</Eyebrow>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
              {f.name}
            </h1>
            <p className="mt-4 max-w-prose text-ink-secondary">{f.tagline}</p>
            <p className="mt-6 max-w-prose text-ink-secondary">{f.description}</p>
            <a href={f.appHref} className={buttonClasses({ variant: "primary" })}>
              Try {f.name} free
            </a>
          </Container>
        </Section>
        <FinalCta title={`Try ${f.name} free`} subtitle="Ten free scores a month." />
      </MarketingShell>
    );
  }

  return (
    <MarketingShell>
      <Section className="pt-20 md:pt-28">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: routes.home },
              { label: "Platform", href: routes.platform },
              { label: doc.name },
            ]}
          />
          <Eyebrow className="mt-6">Platform</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            {doc.name}
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-secondary">
            {doc.tagline}
          </p>

          {doc.demoPlaybackId ? (
            <div className="mt-10 overflow-hidden rounded-lg border border-line shadow-md">
              <MuxVideo
                playbackId={doc.demoPlaybackId}
                title={doc.name}
              />
            </div>
          ) : doc.screenshot ? (
            <div className="mt-10 overflow-hidden rounded-lg border border-line shadow-md">
              <SanityImage
                value={doc.screenshot as never}
                width={1400}
                priority
                sizes="100vw"
              />
            </div>
          ) : null}

          {doc.summary ? (
            <p className="mt-8 max-w-prose text-ink-secondary leading-relaxed">
              {doc.summary}
            </p>
          ) : null}

          {doc.bullets?.length ? (
            <ul className="mt-6 max-w-prose space-y-2 text-ink-secondary">
              {doc.bullets.map((b) => (
                <li key={b}>· {b}</li>
              ))}
            </ul>
          ) : null}

          {doc.appHref ? (
            <a
              href={doc.appHref}
              className={buttonClasses({ variant: "primary", size: "md" }) + " mt-8"}
            >
              Try {doc.name} free
            </a>
          ) : null}

          <p className="mt-10">
            <Link
              href={routes.platform}
              className="text-sm text-accent underline underline-offset-4"
            >
              ← All platform tools
            </Link>
          </p>
        </Container>
      </Section>
      <FinalCta
        title={`Try ${doc.name} free`}
        subtitle="Ten free scores a month. No card required."
        cta={`Open ${doc.name}`}
        href={doc.appHref}
      />
    </MarketingShell>
  );
}
