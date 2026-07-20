import type { Metadata } from "next";
import Link from "next/link";
import { FinalCtaBand } from "@/components/marketing/final-cta-band";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { pageMeta } from "@/lib/meta";
import { CONTACT, routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Trust & data",
  description:
    "How Viralyz handles platform data, exports, deletion, and hosting.",
  path: routes.trust,
});

export default function TrustPage() {
  return (
    <MarketingShell>
      <Section className="pt-20 md:pt-28">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: routes.home },
              { label: "Trust & data" },
            ]}
          />
          <Eyebrow className="mt-6">Trust</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            How we handle your data
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-secondary">
            Short version: official APIs only, you can export or delete anytime,
            and we say where data lives.
          </p>

          <div className="mt-12 max-w-2xl space-y-10">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Official platform APIs only
              </h2>
              <p className="mt-3 text-ink-secondary leading-relaxed">
                Viralyz connects through official TikTok, Instagram, YouTube and
                X APIs. We do not scrape private content, ask for passwords, or
                automate posting outside what each platform allows.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Export and delete anytime
              </h2>
              <p className="mt-3 text-ink-secondary leading-relaxed">
                Your media kits, scores and connected accounts stay under your
                control. You can export your data or delete your account from
                settings. When you disconnect a platform, we stop pulling new
                data from that account.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Where data is hosted
              </h2>
              <p className="mt-3 text-ink-secondary leading-relaxed">
                Application data is hosted in the EU / UK on infrastructure
                operated for Digiteq Holdings Limited. Details live in our{" "}
                <Link
                  href={routes.privacy}
                  className="text-accent underline underline-offset-4"
                >
                  privacy policy
                </Link>
                . Questions:{" "}
                <a
                  href={`mailto:${CONTACT.hello}`}
                  className="text-accent underline underline-offset-4"
                >
                  {CONTACT.hello}
                </a>
                .
              </p>
            </div>
          </div>
        </Container>
      </Section>
      <FinalCtaBand
        title="Questions about security?"
        subtitle="Email us — we answer data and partnership questions on the same inbox."
        cta="Email hello@"
        href={`mailto:${CONTACT.hello}`}
        secondary={{ href: routes.privacy, label: "Read privacy policy" }}
      />
    </MarketingShell>
  );
}
