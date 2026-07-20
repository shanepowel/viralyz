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
    "Creators deserve to know, not guess. Viralyz is a Digiteq company building the scored creator network.",
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
            Creators deserve to know, not guess.
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-secondary">
            Viralyz exists because posting content should not feel like a
            lottery ticket.
          </p>
        </Container>
      </Section>

      <Section tone="default" className="pt-0">
        <Container>
          <div className="max-w-2xl space-y-5 text-base leading-relaxed text-ink-secondary">
            <p>
              Millions of people make content every day. Most of them post it
              and hope. A video that took two days to make can fail because of a
              weak first three seconds, a thumbnail nobody can read, or a
              posting time when the audience was asleep. These problems are
              fixable. Creators just could not see them.
            </p>
            <p>
              <span className="font-semibold text-ink">
                Viralyz makes them visible.
              </span>{" "}
              We score content before it goes live, explain what is wrong in
              plain language, and show what each fix is worth. Then we track
              what really happened against the prediction, and publish our
              accuracy on your profile when we have enough data.
            </p>
            <p>
              Over time, those scores become something bigger: a track record. A
              creator with a year of verified scores has proof that no follower
              count can match. That is why brands are coming too. They would
              rather hire proof than promises.
            </p>
            <p>
              We believe in a few simple things. Show your accuracy, never hide
              it. Help creators make their own version of what works, never
              copies. And follow the platform rules, because a banned account
              helps nobody.
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
                  className="text-accent underline-offset-4 hover:underline"
                >
                  {CONTACT.hello}
                </a>
                {" · "}
                <Link
                  href={routes.trust}
                  className="text-accent underline-offset-4 hover:underline"
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
                body: "We will publish our prediction accuracy on every profile once we have enough measured data. If we are wrong, you will see it.",
              },
              {
                title: "Your work, your data",
                body: "Export or delete everything, any time. Brands only ever see what you choose to share.",
              },
              {
                title: "Platform-safe",
                body: "Automation stays inside the rules. A banned account helps nobody.",
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
        title="See your score"
        subtitle="Ten free scores a month. No card required."
        cta="Start free"
        href={routes.signup}
      />
    </MarketingShell>
  );
}
