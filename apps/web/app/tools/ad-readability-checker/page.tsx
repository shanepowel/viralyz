import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ReadabilityChecker } from "@/components/tools/ReadabilityChecker";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Ad readability checker",
  description: "Get the contrast ratio for your text, and see your ad at the size people see it in a feed. Free, in your browser, nothing uploaded.",
  path: "/tools/ad-readability-checker",
});

export default function Page() {
  return (
    <MarketingShell>
      <Container className="pb-20 pt-[clamp(40px,6vw,80px)]">
        <p className="m-0 mb-4 font-mono text-[12px] text-muted">
          <Link href="/tools" className="underline underline-offset-4 hover:text-ink">
            Free tools
          </Link>{" "}
          / Ad readability checker
        </p>
        <SectionHeader as="h1" eyebrow="Free tool" title="Ad readability checker" lede="Get the contrast ratio for your text, and see your ad at the size people see it in a feed." />
        <ReadabilityChecker />
      </Container>
      <FinalCta
        title="Contrast is one rule of five."
        subtitle="Viralyz runs this and four other rules on every ad it makes, and marks what must change."
        cta="Check a full ad free"
        href={routes.signup}
      />
    </MarketingShell>
  );
}
