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

export const metadata: Metadata = pageMeta({
  title: "Platform",
  description:
    "Every tool feeds one score — Viral Score, Hook Lab, Script Doctor, and more.",
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

const GROUPS = [
  "Score",
  "Create",
  "Intel",
  "Publish",
  "Engage",
  "Earn",
  "Learn",
] as const;

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
          group: i < 2 ? "Score" : i < 4 ? "Create" : "Intel",
          tagline: f.tagline,
          summary: f.description,
          bullets: f.bullets,
          appHref: f.appHref,
        }));

  const byGroup = GROUPS.map((g) => ({
    group: g,
    items: list.filter((f) => f.group === g),
  })).filter((g) => g.items.length > 0);

  const groupsPresent = byGroup.map((g) => g.group);

  return (
    <MarketingShell>
      <Section className="pt-20 md:pt-28 pb-8">
        <Container>
          <Eyebrow>Platform</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Every tool feeds one score.
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-secondary">
            Score, fix, and track in one place. Screenshots and demos below
            show the real product — not stock photos.
          </p>
          {list[0]?.demoPlaybackId ? (
            <div className="mt-10 overflow-hidden rounded-lg border border-line shadow-md">
              <MuxVideo
                playbackId={list[0].demoPlaybackId}
                title="Scoring flow"
                autoplayLoop
              />
            </div>
          ) : list[0]?.screenshot ? (
            <div className="mt-10 overflow-hidden rounded-lg border border-line shadow-md">
              <SanityImage
                value={list[0].screenshot as never}
                width={1400}
                height={800}
                priority
                sizes="100vw"
              />
            </div>
          ) : (
            <div className="mt-10 flex min-h-56 items-center justify-center rounded-lg border border-line bg-sunken text-sm text-ink-tertiary">
              Product screenshots ship with each live feature in Studio.
            </div>
          )}
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[200px_1fr]">
            <PlatformRail groups={groupsPresent} />
            <div className="space-y-20">
              {byGroup.map(({ group, items }) => (
                <section key={group} id={`group-${group.toLowerCase()}`}>
                  <SectionHeader eyebrow={group} title={`${group} tools`} />
                  <div className="space-y-16">
                    {items.map((f, i) => {
                      const mediaLeft = i % 2 === 1;
                      const media = (
                        <div className="overflow-hidden rounded-lg border border-line bg-raised shadow-sm">
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
                            <div className="flex aspect-video items-center justify-center bg-sunken text-sm text-ink-tertiary">
                              Screenshot coming soon
                            </div>
                          )}
                        </div>
                      );
                      const copy = (
                        <div>
                          <h3 className="text-lg font-semibold text-ink">
                            <Link
                              href={`/platform/${f.slug}`}
                              className="hover:text-accent"
                            >
                              {f.name}
                            </Link>
                          </h3>
                          <p className="mt-2 text-ink-secondary leading-relaxed">
                            {f.tagline}
                          </p>
                          {f.summary ? (
                            <p className="mt-3 text-sm text-ink-secondary leading-relaxed">
                              {f.summary}
                            </p>
                          ) : null}
                          {f.bullets?.length ? (
                            <ul className="mt-4 space-y-2 text-sm text-ink-secondary">
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
                  title="Connect the platforms you already post on."
                  lede="Official APIs only. TikTok, Instagram, YouTube and X."
                />
              </section>

              {flags.apiDocsLive ? (
                <section id="api">
                  <SectionHeader
                    eyebrow="API"
                    title="Pull scores into your own tools."
                  />
                </section>
              ) : null}
            </div>
          </div>
        </Container>
      </Section>

      <FinalCta
        title="Start scoring free"
        subtitle="Ten free scores a month. No card required."
      />
    </MarketingShell>
  );
}
