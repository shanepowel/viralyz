import type { Metadata } from "next";
import { DesignSystemGallery } from "@/components/design-system/gallery";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  title: "Design system",
  description:
    "Shared Viralyz components. Buttons, fields, cards, and score treatments from one library.",
  path: "/design-system",
  robots: { index: false, follow: false },
});

export default function DesignSystemPage() {
  return (
    <MarketingShell>
      <div className="pb-20 pt-12 md:pt-16">
        <Container>
          <Eyebrow>Components</Eyebrow>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            One library for the interface.
          </h1>
          <p className="mt-4 max-w-prose leading-relaxed text-ink-secondary">
            Primitives live in <span className="font-mono text-ink">@repo/ui</span>{" "}
            and use the Paper & Signal tokens. Reach for these before drawing a
            new button, field, or card.
          </p>
          <DesignSystemGallery />
        </Container>
      </div>
    </MarketingShell>
  );
}
