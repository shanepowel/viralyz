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
          <p className="mt-4 max-w-prose text-base leading-relaxed text-muted">
            Short version: public ad-library data and your own uploads only,
            you can export or delete anytime, and we say where data lives.
          </p>

          <div className="mt-12 max-w-2xl space-y-10">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Public ad libraries, your own store and exports
              </h2>
              <p className="mt-3 text-muted leading-relaxed">
                Discover reads from Meta&apos;s and TikTok&apos;s own public
                ad libraries — no scraping, no account access. Brand import
                reads only the store URL you give us, through a fetch layer
                that refuses to touch internal or private addresses. Results
                reads only the Ads Manager export file you upload yourself.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Export and delete anytime
              </h2>
              <p className="mt-3 text-muted leading-relaxed">
                Your brand, generated creative, and performance imports stay
                under your control. You can export your data or delete your
                account from settings.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Where data is hosted
              </h2>
              <p className="mt-3 text-muted leading-relaxed">
                Application data is hosted in the EU / UK on infrastructure
                operated for Digiteq Holdings Limited. Details live in our{" "}
                <Link
                  href={routes.privacy}
                  className="text-ink underline underline-offset-4"
                >
                  privacy policy
                </Link>
                . Questions:{" "}
                <a
                  href={`mailto:${CONTACT.hello}`}
                  className="text-ink underline underline-offset-4"
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
