import type { Metadata } from "next";
import Link from "next/link";
import { FinalCtaBand } from "@/components/marketing/final-cta-band";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PageBuilder } from "@/components/page-builder/PageBuilder";
import { HeroDemo } from "@/components/score/HeroDemo";
import { buttonClasses } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Marquee } from "@/components/ui/Marquee";
import { Num } from "@/components/ui/Num";
import { Section } from "@/components/ui/Section";
import { pageMeta } from "@/lib/meta";
import { productStats, routes } from "@/lib/site";
import { fetchSanity } from "@/sanity/lib/fetch";
import { PAGE_QUERY } from "@/sanity/lib/queries";

export const metadata: Metadata = pageMeta({
  title: "Generate ad creative, pre-flight it before you spend",
  description:
    "Discover what's working in your category, confirm your brand once, and generate on-brand ad variants that are checked before you ever see them.",
  path: routes.home,
});

export default async function HomePage() {
  const page = await fetchSanity<{
    pageBuilder?: { _type: string; _key?: string; [k: string]: unknown }[];
  }>({
    query: PAGE_QUERY,
    params: { slug: "home" },
  });

  if (page?.pageBuilder?.length) {
    return (
      <MarketingShell>
        <PageBuilder blocks={page.pageBuilder} />
      </MarketingShell>
    );
  }

  return (
    <MarketingShell>
      <Section className="pt-20 md:pt-28">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Eyebrow>Viralyz</Eyebrow>
              <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight leading-[1.05] md:text-6xl">
                Generate ad creative. Pre-flight it before you spend.
              </h1>
              <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-secondary md:text-lg">
                Discover real running ads in your category, confirm your
                brand once, and generate on-brand variants that are checked
                for contrast, safe zone, and policy — before you ever see
                them.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={routes.signup}
                  className={buttonClasses({ variant: "primary", size: "lg" })}
                >
                  Start free with 10 credits
                </a>
                <Link
                  href={routes.platform}
                  className={buttonClasses({ variant: "link", size: "lg" })}
                >
                  See how it works
                </Link>
              </div>
            </div>
            <HeroDemo />
          </div>
        </Container>
      </Section>
      <Marquee />
      <Section tone="sunken">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {productStats.map((s) => (
              <div key={s.label}>
                <p className="font-mono text-3xl font-semibold tracking-tight">
                  <Num>{s.value}</Num>
                </p>
                <p className="mt-1 text-sm text-ink-secondary">{s.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
      <FinalCtaBand
        title="Generate your first ad variant"
        subtitle="10 free credits on signup. No card required."
        cta="Start free with 10 credits"
      />
    </MarketingShell>
  );
}
