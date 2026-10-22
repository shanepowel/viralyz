import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FinalCtaBand } from "@/components/marketing/final-cta-band";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { VariantMock } from "@/components/studio/VariantMock";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buttonClasses } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { features, getFeature } from "@/data/features";
import { pageMeta } from "@/lib/meta";
import { productFacts, routes } from "@/lib/site";

type Params = Promise<{ feature: string }>;

export function generateStaticParams() {
  return features.map((f) => ({ feature: f.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const f = getFeature((await params).feature);
  if (!f) return {};
  return pageMeta({
    title: f.name,
    description: f.tagline,
    path: `/platform/${f.slug}`,
  });
}

export default async function FeaturePage({ params }: { params: Params }) {
  const f = getFeature((await params).feature);
  if (!f) notFound();

  const prev = features.find((x) => x.step === f.step - 1);
  const next = features.find((x) => x.step === f.step + 1);

  return (
    <MarketingShell>
      <Section className="pt-14 md:pt-20">
        <Breadcrumbs
          items={[
            { label: "Home", href: routes.home },
            { label: "Product", href: routes.platform },
            { label: f.name },
          ]}
        />
        <div className="mt-6 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <Eyebrow>
              Step {f.step} of {features.length}
            </Eyebrow>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
              {f.name}
            </h1>
            <p className="mt-4 text-lg leading-snug text-ink-secondary">
              {f.tagline}
            </p>
            <p className="mt-6 max-w-prose leading-relaxed text-ink-secondary">
              {f.description}
            </p>
            <ul className="mt-6 max-w-prose space-y-2">
              {f.bullets.map((b) => (
                <li key={b} className="flex gap-3 text-ink-secondary">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    aria-hidden
                  />
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-8 max-w-prose rounded-md border border-line bg-sunken p-5">
              <p className="text-sm font-semibold text-ink">
                What it won&apos;t claim
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                {f.limits}
              </p>
            </div>
            <a
              href={f.appHref}
              className={buttonClasses({ variant: "primary", size: "md" }) + " mt-8"}
            >
              {f.appLabel}
            </a>
          </div>
          {f.slug === "studio" || f.slug === "pre-flight" ? (
            <VariantMock />
          ) : null}
        </div>

        <nav
          aria-label="Other steps"
          className="mt-16 flex flex-wrap justify-between gap-4 border-t border-line pt-6 text-sm"
        >
          {prev ? (
            <Link href={`/platform/${prev.slug}`} className="text-ink-secondary hover:text-accent">
              ← Step {prev.step}: {prev.name}
            </Link>
          ) : (
            <Link href={routes.platform} className="text-ink-secondary hover:text-accent">
              ← All steps
            </Link>
          )}
          {next ? (
            <Link href={`/platform/${next.slug}`} className="text-ink-secondary hover:text-accent">
              Step {next.step}: {next.name} →
            </Link>
          ) : (
            <Link href={routes.trust} className="text-ink-secondary hover:text-accent">
              How we measure →
            </Link>
          )}
        </nav>
      </Section>
      <FinalCtaBand
        title={`Try ${f.name} on your own product`}
        subtitle={`Start with ${productFacts.signupCredits} free credits. No card needed.`}
        cta={f.appLabel}
        href={f.appHref}
      />
    </MarketingShell>
  );
}
