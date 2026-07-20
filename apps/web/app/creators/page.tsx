import Link from "next/link";
import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Num } from "@/components/ui/Num";
import { Section } from "@/components/ui/Section";
import { ScoreRing } from "@/components/score/ScoreRing";
import {
  CREATOR_NICHES,
  creators,
  creatorInitials,
  formatFollowers,
  formatViews,
} from "@/data/creators";
import { flags } from "@/lib/flags";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Browse creators",
  description: "Search creator profiles by niche, score, and platform.",
  path: routes.creators,
});

const PLATFORMS = ["TikTok", "Instagram", "YouTube", "X"] as const;

type SearchParams = Promise<{ niche?: string; q?: string; platform?: string }>;

export default async function CreatorsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = (await searchParams) ?? {};
  const niche = params.niche?.trim();
  const q = params.q?.trim().toLowerCase();
  const platform = params.platform?.trim();

  const list = creators.filter((c) => {
    if (niche && c.niche.toLowerCase() !== niche.toLowerCase()) return false;
    if (platform && c.platform.toLowerCase() !== platform.toLowerCase())
      return false;
    if (
      q &&
      !c.name.toLowerCase().includes(q) &&
      !c.handle.toLowerCase().includes(q) &&
      !c.niche.toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });

  return (
    <MarketingShell>
      <Section className="pt-20 md:pt-28 pb-8">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: routes.home },
              { label: "For brands", href: routes.forBrands },
              { label: "Browse creators" },
            ]}
          />
          <Eyebrow className="mt-6">Founding roster · example profiles</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Find creators with the numbers to prove it
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-secondary">
            Profiles are verified against connected platform accounts. No
            self-reported stats.
          </p>
          <form
            className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
            action={routes.creators}
            method="get"
          >
            {niche ? <input type="hidden" name="niche" value={niche} /> : null}
            {platform ? (
              <input type="hidden" name="platform" value={platform} />
            ) : null}
            <input
              type="search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search by name, niche or @handle"
              className="h-11 flex-1 rounded-sm border border-line bg-raised px-3.5 text-sm text-ink shadow-sm placeholder:text-ink-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            <button
              type="submit"
              className={buttonClasses({ variant: "primary", size: "md" })}
            >
              Search
            </button>
          </form>
        </Container>
      </Section>

      <Section tone="default" className="pt-0">
        <Container>
          {!flags.marketplaceLive ? (
            <div className="mb-8 rounded-md border border-line bg-accent-soft px-4 py-3 text-sm text-ink-secondary">
              These are example profiles showing how verified creator data will
              look. Real creators are onboarding now —{" "}
              <Link
                href={routes.forCreators}
                className="text-accent underline-offset-4 hover:underline"
              >
                join the founding roster
              </Link>
              .
            </div>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
            <aside className="space-y-6">
              <div>
                <p className="mb-2 text-sm font-medium uppercase tracking-wide text-ink-tertiary">
                  Platform
                </p>
                <div className="flex flex-col gap-1">
                  {PLATFORMS.map((p) => (
                    <Link
                      key={p}
                      href={`${routes.creators}?platform=${encodeURIComponent(p)}${niche ? `&niche=${encodeURIComponent(niche)}` : ""}`}
                      className={cn(
                        "rounded-sm px-3 py-2 text-sm transition-colors",
                        platform === p
                          ? "bg-sunken font-medium text-ink"
                          : "text-ink-secondary hover:bg-sunken hover:text-ink",
                      )}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium uppercase tracking-wide text-ink-tertiary">
                  Category
                </p>
                <div className="flex flex-col gap-1">
                  {CREATOR_NICHES.map((n) => (
                    <Link
                      key={n}
                      href={`${routes.creators}?niche=${encodeURIComponent(n)}`}
                      className={cn(
                        "rounded-sm px-3 py-2 text-sm transition-colors",
                        niche?.toLowerCase() === n.toLowerCase()
                          ? "bg-sunken font-medium text-ink"
                          : "text-ink-secondary hover:bg-sunken hover:text-ink",
                      )}
                    >
                      {n}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <Link
                  href={routes.forBrands}
                  className="text-ink-secondary hover:text-ink"
                >
                  For brands overview
                </Link>
                <Link
                  href={routes.pricing}
                  className="text-ink-secondary hover:text-ink"
                >
                  Pricing
                </Link>
                <Link
                  href={routes.contact}
                  className="text-ink-secondary hover:text-ink"
                >
                  Talk to sales
                </Link>
              </div>
            </aside>

            <div>
              {list.length === 0 ? (
                <EmptyState
                  heading="No creators match those filters yet"
                  body="The founding roster is still growing. Clear a filter or check back soon."
                  action={{ href: routes.creators, label: "Reset filters" }}
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {list.map((c) => (
                    <Link key={c.slug} href={`/kit/${c.slug}`}>
                      <Card hoverable className="h-full overflow-hidden p-0">
                        <div
                          className="relative flex h-36 items-center justify-center text-2xl font-semibold text-white"
                          style={{ background: c.face }}
                          aria-hidden
                        >
                          {creatorInitials(c)}
                          <span className="absolute bottom-2 right-2 rounded-sm bg-black/40 px-2 py-0.5 text-xs text-white">
                            {c.platform}
                          </span>
                        </div>
                        <div className="flex items-start justify-between gap-3 p-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold text-ink">
                                {c.name}
                              </h3>
                              {c.demo && !flags.marketplaceLive ? (
                                <Badge variant="demo" />
                              ) : null}
                            </div>
                            <p className="mt-1 text-sm text-ink-tertiary">
                              {c.niche} ·{" "}
                              <Num>{formatFollowers(c.followers)}</Num>
                            </p>
                            <p className="mt-2 text-sm text-ink-secondary">
                              Avg views <Num>{formatViews(c.avgViews)}</Num>
                            </p>
                          </div>
                          <ScoreRing
                            value={c.score}
                            size={56}
                            animate={false}
                            label={`${c.name} score ${c.score}`}
                          />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </MarketingShell>
  );
}
