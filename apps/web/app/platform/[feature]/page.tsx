import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { stegaClean } from "@sanity/client/stega";
import { FinalCtaBand } from "@/components/marketing/final-cta-band";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { StepPills } from "@/components/marketing/step-pills";
import { MuxVideo } from "@/components/media/MuxVideo";
import { SanityImage } from "@/components/media/SanityImage";
import {
  FeatureShowcase,
  showcaseCaption,
} from "@/components/studio/FeatureShowcase";
import {
  PREFLIGHT_LIMITS,
  PreflightChecksGrid,
} from "@/components/studio/PreflightChecks";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DotPanel } from "@/components/ui/DotPanel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { features as staticFeatures, getFeature } from "@/data/features";
import { pageMeta } from "@/lib/meta";
import { productFacts, routes } from "@/lib/site";
import { cleanSlug, fetchSanity } from "@/sanity/lib/fetch";
import { FEATURE_QUERY, FEATURE_SLUGS_QUERY } from "@/sanity/lib/queries";

type Params = Promise<{ feature: string }>;

type FeatureDoc = {
  name: string;
  slug: string;
  tagline?: string;
  summary?: string;
  bullets?: string[];
  appHref?: string;
  screenshot?: unknown;
  demoPlaybackId?: string | null;
};

/** Page-specific copy from the Studio design; other steps use their feature copy. */
const PREFLIGHT_HERO = {
  title: "Every variant checked before it gets a penny",
  lede: "Six checks run the moment a variant is generated. You see what passed, what will cost you reach, and the one-click fix, before you open Ads Manager.",
};

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

  const doc = await fetchSanity<FeatureDoc>({
    query: FEATURE_QUERY,
    params: { slug },
  });

  const fallback = getFeature(slug);
  if (!doc && !fallback) notFound();

  const f: FeatureDoc = doc ?? {
    name: fallback!.name,
    slug: fallback!.slug,
    tagline: fallback!.tagline,
    summary: fallback!.description,
    bullets: fallback!.bullets,
    appHref: fallback!.appHref,
  };

  const isPreflight = slug === "pre-flight";
  const order = staticFeatures.findIndex((s) => s.slug === slug);
  const next = order >= 0 ? staticFeatures[order + 1] : undefined;
  const appHref = f.appHref || routes.signup;

  const hasMedia = Boolean(f.demoPlaybackId || f.screenshot);

  return (
    <MarketingShell>
      {/* Step pills + hero */}
      <Container className="flex flex-col items-center gap-[22px] pb-12 pt-[clamp(40px,6vw,72px)] text-center">
        <StepPills current={slug} />
        <h1 className="m-0 max-w-[1000px] font-display text-[clamp(42px,6.2vw,80px)]">
          {isPreflight ? PREFLIGHT_HERO.title : f.tagline || f.name}
        </h1>
        <p className="m-0 max-w-[600px] text-[19px] text-muted">
          {isPreflight ? PREFLIGHT_HERO.lede : f.summary}
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          <ButtonLink href={appHref} size="lg">
            {isPreflight ? "Run pre-flight free" : `Try ${f.name} free`}
          </ButtonLink>
          <ButtonLink
            href={isPreflight ? "#checks" : "#details"}
            size="lg"
            variant="secondary"
          >
            {isPreflight ? "See the six checks" : "What you get"}
          </ButtonLink>
        </div>
      </Container>

      {/* Product showcase */}
      <Container className="pb-6">
        <DotPanel>
          {f.demoPlaybackId ? (
            <div className="overflow-hidden rounded-card border border-line shadow-float">
              <MuxVideo playbackId={f.demoPlaybackId} title={f.name} />
            </div>
          ) : f.screenshot ? (
            <div className="overflow-hidden rounded-card border border-line shadow-float">
              <SanityImage
                value={f.screenshot as never}
                width={1400}
                priority
                sizes="100vw"
              />
            </div>
          ) : (
            <FeatureShowcase slug={slug} />
          )}
        </DotPanel>
        {hasMedia ? null : (
          <p className="mb-0 mt-3 text-center text-xs text-muted">
            {showcaseCaption(slug)}
          </p>
        )}
      </Container>

      {isPreflight ? (
        <>
          <Container
            id="checks"
            className="flex flex-col items-center gap-9 py-24"
          >
            <SectionHeader
              eyebrow="The six checks"
              title="Five rules and one honest estimate"
              className="mb-0"
            />
            <PreflightChecksGrid />
            <p className="m-0 text-xs text-muted">
              Illustrations use fictional brands.
            </p>
          </Container>

          <Container className="flex flex-col items-center gap-9 pb-24">
            <h2 className="m-0 text-center font-display text-[clamp(30px,4vw,48px)]">
              What pre-flight can’t tell you
            </h2>
            <ul className="m-0 grid w-full list-none grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-3 p-0">
              {PREFLIGHT_LIMITS.map((item) => (
                <li
                  key={item.title}
                  className="flex flex-col gap-2 rounded-card bg-panel p-6"
                >
                  <strong className="font-semibold">{item.title}</strong>
                  <span className="text-[15px] text-muted">{item.body}</span>
                </li>
              ))}
            </ul>
          </Container>
        </>
      ) : f.bullets?.length ? (
        <Container
          id="details"
          className="flex flex-col items-center gap-9 py-24"
        >
          <SectionHeader
            eyebrow={f.name}
            title="What you get"
            className="mb-0"
          />
          <ul className="m-0 grid w-full list-none grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-3 p-0">
            {f.bullets.map((b) => (
              <li key={b} className="rounded-card bg-panel p-6 text-[15px]">
                {b}
              </li>
            ))}
          </ul>
        </Container>
      ) : (
        <div id="details" className="py-12" />
      )}

      <FinalCtaBand
        title={
          isPreflight
            ? "Check your next variant before it costs you"
            : `Try ${f.name} free`
        }
        subtitle={`${productFacts.freeCredits} free credits on signup. No card required.`}
        href={isPreflight ? routes.signup : appHref}
        secondary={
          next
            ? { href: `/platform/${next.slug}`, label: `Next: ${next.name} →` }
            : { href: routes.platform, label: "All platform steps" }
        }
      />
    </MarketingShell>
  );
}
