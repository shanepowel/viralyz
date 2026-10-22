import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { pageMeta } from "@/lib/meta";
import { COMPANY, CONTACT, routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "About",
  description:
    "Viralyz helps online sellers make better ad creative without guessing. A Digiteq company.",
  path: routes.about,
});

export default function AboutPage() {
  return (
    <MarketingShell>
      <Section className="pt-20 md:pt-28">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: routes.home },
              { label: "About" },
            ]}
          />
          <Eyebrow className="mt-6">About</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Sellers deserve better than guessing.
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-secondary">
            Viralyz exists because launching an ad shouldn&apos;t feel like a
            lottery ticket.
          </p>
        </Container>
      </Section>

      <Section tone="default" className="pt-0">
        <Container>
          <div className="max-w-2xl space-y-5 text-base leading-relaxed text-ink-secondary">
            <p>
              Most small sellers make ads the same way: look at what
              competitors run, make something similar, launch it, and hope.
              When it doesn&apos;t work, it&apos;s hard to tell whether the
              idea was wrong or the execution was. Text nobody could read, a
              headline hidden under the reply bar, a claim the platform quietly
              limited.
            </p>
            <p>
              <span className="font-semibold text-ink">
                Viralyz makes that process deliberate.
              </span>{" "}
              Start from ads advertisers have kept paying for. Borrow their
              structure, never their assets. Generate variants from your own
              confirmed brand details. Check each one against the
              platform&apos;s published specs before you spend. Then import
              what happened and see how well the checks predicted it.
            </p>
            <p>
              We hold ourselves to one rule: no claim without a measurement. If
              we can&apos;t measure something, the number stays blank and we
              tell you why. A tool that&apos;s honest about what it doesn&apos;t
              know is more useful than one that&apos;s confidently wrong.
            </p>
          </div>

          <div className="mt-12 rounded-md border border-line bg-raised p-6 shadow-sm md:flex md:gap-5">
            <div
              className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-accent-soft font-display text-lg font-semibold text-accent md:mb-0"
              aria-hidden
            >
              D
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">
                Viralyz is a Digiteq company
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                {COMPANY.legalName} (company number {COMPANY.number}) is a UK
                company that builds and grows digital products. Viralyz is built
                and operated by Digiteq from {COMPANY.location}. Sister products
                include BMKRS, FreelanceNearMe, Konduit and three18media.
              </p>
              <p className="mt-3 text-sm text-ink-secondary">
                Contact:{" "}
                <a
                  href={`mailto:${CONTACT.hello}`}
                  className="text-accent underline underline-offset-4"
                >
                  {CONTACT.hello}
                </a>
                {" · "}
                <Link
                  href={routes.trust}
                  className="text-accent underline underline-offset-4"
                >
                  Trust &amp; data
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "No claim without a measurement",
                body: "Scores stay blank until there is enough data behind them, and every check shows its evidence.",
              },
              {
                title: "Official sources",
                body: "References come from official ad libraries or from you. We don't scrape ad platforms.",
              },
              {
                title: "Your brand, not someone else's",
                body: "Studio borrows structure from references. It never copies their images, logos or wording.",
              },
            ].map((v) => (
              <div key={v.title}>
                <h3 className="text-lg font-semibold text-ink">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <FinalCta
        title="Make your next ad from one that works"
        subtitle="Start with 10 free credits. No card needed."
        cta="Start free"
        href={routes.signup}
      />
    </MarketingShell>
  );
}
