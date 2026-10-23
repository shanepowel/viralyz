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
    "Sellers deserve to know, not guess. Viralyz is a Digiteq company building ad creative that's checked before you spend.",
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
            Sellers deserve to know, not guess.
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-muted">
            Viralyz exists because spending ad budget on creative that gets
            rejected or ignored should not feel like a lottery ticket.
          </p>
        </Container>
      </Section>

      <Section tone="default" className="pt-0">
        <Container>
          <div className="max-w-2xl space-y-5 text-base leading-relaxed text-muted">
            <p>
              Sellers run ad creative every day on money they cannot get back.
              A variant that took real spend to test can fail because of poor
              contrast, text in the wrong safe zone, a policy issue the
              platform flags, or a hook that just does not land. These
              problems are fixable before a single dollar is spent — most
              sellers just have no way to check for them ahead of time.
            </p>
            <p>
              <span className="font-semibold text-ink">
                Viralyz checks them first.
              </span>{" "}
              Discover what is already working in your category, confirm
              your brand once, and generate variants that run through
              automated pre-flight checks before you ever see them. Then
              import your real spend data and we show you what pre-flight
              actually predicted — once there is enough of it to say so
              honestly.
            </p>
            <p>
              We believe in a few simple things. Show a headline number only
              once enough checks actually scored it, never a guess dressed up
              as a measurement. Label every generated variant as AI-generated,
              no exceptions. And never show a calibration number until there
              is real matched spend data behind it.
            </p>
          </div>

          <div className="mt-12 rounded-inner border border-line bg-card p-6 md:flex md:gap-5">
            <div
              className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-inner bg-panel font-display text-lg font-semibold text-ink md:mb-0"
              aria-hidden
            >
              D
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">
                Viralyz is a Digiteq company
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {COMPANY.legalName} (company number {COMPANY.number}) is a UK
                company that builds and grows digital products. Viralyz is built
                and operated by Digiteq from {COMPANY.location}. Sister products
                include BMKRS, FreelanceNearMe, Konduit and three18media.
              </p>
              <p className="mt-3 text-sm text-muted">
                Contact:{" "}
                <a
                  href={`mailto:${CONTACT.hello}`}
                  className="text-ink underline underline-offset-4"
                >
                  {CONTACT.hello}
                </a>
                {" · "}
                <Link
                  href={routes.trust}
                  className="text-ink underline underline-offset-4"
                >
                  Trust &amp; data
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Honest numbers",
                body: "A headline pre-flight number never appears until at least 4 checks actually scored it. Below that, we say so instead of guessing.",
              },
              {
                title: "Your brand, your data",
                body: "Export or delete your brand assets and generated creative, any time.",
              },
              {
                title: "No invented accuracy",
                body: "Calibration against real performance only shows once you have 20+ matched ads — not before.",
              },
            ].map((v) => (
              <div key={v.title}>
                <h3 className="text-lg font-semibold text-ink">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <FinalCta
        title="Generate your first variant"
        subtitle="10 free credits on signup. No card required."
        cta="Start free"
        href={routes.signup}
      />
    </MarketingShell>
  );
}
