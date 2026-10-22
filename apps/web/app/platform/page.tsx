import type { Metadata } from "next";
import Link from "next/link";
import { FinalCtaBand } from "@/components/marketing/final-cta-band";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { LoopDiagram } from "@/components/studio/LoopDiagram";
import { buttonClasses } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { features } from "@/data/features";
import { cn } from "@/lib/cn";
import { pageMeta } from "@/lib/meta";
import { productFacts, routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Product",
  description:
    "Discover, Brand kit, Studio, Pre-flight checks and Results: the five steps of the Viralyz creative loop.",
  path: routes.platform,
});

export default function PlatformPage() {
  return (
    <MarketingShell>
      <Section className="pt-14 md:pt-24">
        <Eyebrow>Product</Eyebrow>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          One loop: find what runs, make yours, check it, learn.
        </h1>
        <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-secondary">
          Viralyz is five tools that hand work to each other. Each one says
          plainly what it measures and where its data runs out.
        </p>
        <div className="mt-12">
          <LoopDiagram />
        </div>
      </Section>

      {features.map((f, i) => (
        <Section
          key={f.slug}
          id={f.slug}
          tone={i % 2 === 0 ? "sunken" : "default"}
        >
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="font-mono text-sm text-accent">
                Step {String(f.step).padStart(2, "0")}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
                <Link href={`/platform/${f.slug}`} className="hover:text-accent">
                  {f.name}
                </Link>
              </h2>
              <p className="mt-3 text-lg leading-snug text-ink-secondary">
                {f.tagline}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={f.appHref}
                  className={buttonClasses({ variant: "secondary", size: "sm" })}
                >
                  {f.appLabel}
                </a>
                <Link
                  href={`/platform/${f.slug}`}
                  className={cn(buttonClasses({ variant: "ghost", size: "sm" }))}
                >
                  Details
                </Link>
              </div>
            </div>
            <div>
              <p className="leading-relaxed text-ink-secondary">
                {f.description}
              </p>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {f.bullets.map((b) => (
                  <li
                    key={b}
                    className="rounded-sm border border-line bg-raised px-3 py-2 text-sm text-ink-secondary"
                  >
                    {b}
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-l-2 border-line-strong pl-4 text-sm leading-relaxed text-ink-tertiary">
                <span className="font-medium text-ink-secondary">Limits: </span>
                {f.limits}
              </p>
            </div>
          </div>
        </Section>
      ))}

      <FinalCtaBand
        title="Try the loop on your own product"
        subtitle={`Start with ${productFacts.signupCredits} free credits. Discover, Brand kit and Results don't use credits.`}
        cta="Start free"
        secondary={{ href: routes.trust, label: "How we measure" }}
      />
    </MarketingShell>
  );
}
