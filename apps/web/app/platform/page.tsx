import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { SanityImage } from "@/components/media/SanityImage";
import { MuxVideo } from "@/components/media/MuxVideo";
import { buttonClasses } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { features as staticFeatures } from "@/data/features";
import { cn } from "@/lib/cn";
import { flags } from "@/lib/flags";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";
import { fetchSanity } from "@/sanity/lib/fetch";
import { FEATURES_QUERY } from "@/sanity/lib/queries";
import { PlatformRail } from "@/components/marketing/platform-rail";
import { StepPills } from "@/components/marketing/step-pills";
import {
  FeatureShowcase,
  showcaseCaption,
} from "@/components/studio/FeatureShowcase";

export const metadata: Metadata = pageMeta({
  title: "Platform",
  description:
    "Discover what's working, confirm your brand, generate variants, pre-flight them, and see what the data says. Five steps, one product.",
  path: routes.platform,
});

type Feature = {
  _id: string;
  name: string;
  slug: string;
  group?: string | null;
  tagline?: string | null;
  summary?: string | null;
  bullets?: string[] | null;
  appHref?: string | null;
  screenshot?: unknown;
  demoPlaybackId?: string | null;
};

export default async function PlatformPage() {
  const remote = await fetchSanity<Feature[]>({
    query: FEATURES_QUERY,
  });

  const list: Feature[] =
    remote?.length
      ? remote
      : staticFeatures.map((f, i) => ({
          _id: f.slug,
          name: f.name,
          slug: f.slug,
          group: i < 2 ? "Plan" : "Ship",
          tagline: f.tagline,
          summary: f.description,
          bullets: f.bullets,
          appHref: f.appHref,
        }));

  // Group by whatever `group` values are actually present, in order of
  // first appearance — not a hardcoded allowlist. The Studio schema's
  // feature documents can use a different group taxonomy than our own
  // static fallback; filtering against a fixed list silently dropped
  // every live feature whose group didn't happen to match it.
  const groupsPresent: string[] = [];
  for (const f of list) {
    const g = f.group?.trim();
    if (g && !groupsPresent.includes(g)) groupsPresent.push(g);
  }
  const byGroup = groupsPresent
    .map((g) => ({ group: g, items: list.filter((f) => f.group === g) }))
    .filter((g) => g.items.length > 0);

  return (
    <MarketingShell>
      <Container className="flex flex-col items-center gap-[22px] pb-12 pt-[clamp(48px,7vw,88px)] text-center">
        <Eyebrow>Platform</Eyebrow>
        <h1 className="m-0 max-w-[1000px] font-display text-[clamp(42px,6.2vw,80px)]">
          Five steps. One pre-flighted output.
        </h1>
        <p className="m-0 max-w-[600px] text-[19px] text-muted">
          Discover, Brand, Studio, Pre-flight, Results. Screenshots and demos
          below show the real product, not stock photos.
        </p>
        <StepPills current="" />
        {list[0]?.demoPlaybackId ? (
          <div className="mt-6 w-full overflow-hidden rounded-card border border-line shadow-float">
            <MuxVideo
              playbackId={list[0].demoPlaybackId}
              title="Discover to Studio"
              autoplayLoop
            />
          </div>
        ) : list[0]?.screenshot ? (
          <div className="mt-6 w-full overflow-hidden rounded-card border border-line shadow-float">
            <SanityImage
              value={list[0].screenshot as never}
              width={1400}
              height={800}
              priority
              sizes="100vw"
            />
          </div>
        ) : null}
      </Container>

      <Section className="pt-0">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[200px_1fr]">
            <PlatformRail groups={groupsPresent} />
            <div className="space-y-20">
              {byGroup.map(({ group, items }) => (
                <section key={group} id={`group-${group.toLowerCase()}`}>
                  <SectionHeader
                    eyebrow={group}
                    title={`${group} tools`}
                    align="left"
                  />
                  <div className="space-y-16">
                    {items.map((f, i) => {
                      const mediaLeft = i % 2 === 1;
                      const media = (
                        <div className="overflow-hidden rounded-card border border-line bg-card">
                          {f.demoPlaybackId ? (
                            <MuxVideo
                              playbackId={f.demoPlaybackId}
                              title={f.name}
                              autoplayLoop
                            />
                          ) : f.screenshot ? (
                            <SanityImage
                              value={f.screenshot as never}
                              width={900}
                              sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                          ) : (
                            <figure className="m-0">
                              <div className="dots flex min-h-72 items-center justify-center bg-panel p-6 [&_.shadow-float]:shadow-none">
                                <FeatureShowcase slug={f.slug} />
                              </div>
                              <figcaption className="border-t border-line px-4 py-2 text-xs text-muted">
                                {showcaseCaption(f.slug)}
                              </figcaption>
                            </figure>
                          )}
                        </div>
                      );
                      const copy = (
                        <div>
                          <h3 className="text-lg font-semibold text-ink">
                            <Link
                              href={`/platform/${f.slug}`}
                              className="hover:text-muted"
                            >
                              {f.name}
                            </Link>
                          </h3>
                          <p className="mt-2 text-muted leading-relaxed">
                            {f.tagline}
                          </p>
                          {f.summary ? (
                            <p className="mt-3 text-sm text-muted leading-relaxed">
                              {f.summary}
                            </p>
                          ) : null}
                          {f.bullets?.length ? (
                            <ul className="mt-4 space-y-2 text-sm text-muted">
                              {f.bullets.map((b) => (
                                <li key={b}>· {b}</li>
                              ))}
                            </ul>
                          ) : null}
                          {f.appHref ? (
                            <a
                              href={f.appHref}
                              className={cn(
                                buttonClasses({ variant: "secondary", size: "sm" }),
                                "mt-5",
                              )}
                            >
                              Try {f.name} free
                            </a>
                          ) : null}
                        </div>
                      );
                      return (
                        <div
                          key={f._id}
                          className="grid items-center gap-8 lg:grid-cols-2"
                        >
                          {mediaLeft ? (
                            <>
                              {media}
                              {copy}
                            </>
                          ) : (
                            <>
                              {copy}
                              {media}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}

              <section id="integrations">
                <SectionHeader
                  eyebrow="Integrations"
                  title="Sourced from where the ads actually run."
                  align="left"
                  lede="Meta and TikTok's own ad libraries for Discover. Meta and TikTok Ads Manager exports for Results."
                />
              </section>

              {flags.apiDocsLive ? (
                <section id="api">
                  <SectionHeader
                    eyebrow="API"
                    title="Pull results into your own tools."
                    align="left"
                  />
                </section>
              ) : null}
            </div>
          </div>
        </Container>
      </Section>

      <FinalCta
        title="Start generating free"
        subtitle="10 free credits on signup. No card required."
      />
    </MarketingShell>
  );
}
