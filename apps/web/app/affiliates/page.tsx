import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { buttonClasses } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Affiliates",
  description: "Affiliate program launching soon — leave your email.",
  path: routes.affiliates,
  robots: { index: false, follow: false },
});

export default function AffiliatesPage() {
  return (
    <MarketingShell>
      <Section className="pt-20 md:pt-28">
        <Container>
          <Eyebrow>Affiliates</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Affiliate program launching soon
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-secondary">
            We are defining commission terms before we open applications. Email
            us if you want on the list — no vague promises in the meantime.
          </p>
          <Link
            href={routes.contact}
            className={buttonClasses({ variant: "primary", size: "md" }) + " mt-8"}
          >
            Get notified at launch
          </Link>
        </Container>
      </Section>
    </MarketingShell>
  );
}
