import type { Metadata } from "next";
import Link from "next/link";
import { FinalCtaBand } from "@/components/marketing/final-cta-band";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { pageMeta } from "@/lib/meta";
import { CONTACT, productFacts, routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "How we measure",
  description:
    "Where Viralyz's references come from, what each number means, when it stays blank, and how your data is handled.",
  path: routes.trust,
});

const SECTIONS: { id: string; title: string; body: React.ReactNode[] }[] = [
  {
    id: "sources",
    title: "Where references come from",
    body: [
      "Discover uses two official sources: the Meta Ad Library API, which covers ads shown in the EU and UK, and TikTok's Commercial Content Library, which covers ads in its approved markets. We don't scrape ad platforms.",
      "Neither source covers US-only ads, and we'd rather show you a gap than fill it with guesses. You can add any ad or product page yourself by link, or upload a screenshot. Your own references are visible only to you.",
      "Every reference card shows its source and links to the original where one exists. For Meta ads that's the public Ad Library page.",
    ],
  },
  {
    id: "signals",
    title: "What “running for 40 days” means",
    body: [
      "Ad libraries publish when an ad started and whether it's still live, not its sales or click-through rate. So we show days running and how many variants an advertiser made, and nothing more. We never label an ad a winner.",
      "When a number isn't available for an ad, it's left out rather than shown as zero.",
    ],
  },
  {
    id: "studio",
    title: "What Studio borrows from a reference",
    body: [
      "Studio reads a reference's structure, such as the kind of hook, the offer and the layout, and writes new copy for your product from your confirmed brand kit. It doesn't copy the reference's images, logos or wording.",
      "Headlines and calls to action are set as real text over the generated image. Image prompts are screened first, and prompts asking for a real person's likeness or for text painted into the image are refused.",
    ],
  },
  {
    id: "pre-flight",
    title: "What the pre-flight score is, and isn't",
    body: [
      "Each variant is checked against the published ad specs for its placement: text contrast, text-to-image area, safe-zone overlap, aspect ratio, and headline and primary-text length. Claim checks flag before-and-after, health, income and personal-attribute wording. Each check shows its evidence.",
      `The score is the share of those checks that passed. It appears only once at least ${productFacts.minScoredChecks} checks have actually run; otherwise it's blank. It measures whether an ad meets the spec, not how well it will sell.`,
      "Hook clarity is assessed by an AI model and shown as a separate note. It doesn't count toward the score unless your own results show that it tracks real performance.",
    ],
  },
  {
    id: "calibration",
    title: "How calibration works",
    body: [
      "Each variant carries a short tracking tag (like vz_k3p9). Put it in the ad name when you launch, export your results from Ads Manager as a CSV, and import it. Rows are matched to variants by tag, and rows without a match are listed so you can fix them.",
      `Results then compares pre-flight scores with real click-through rate using a rank correlation. It needs at least ${productFacts.calibrationMinAds} matched ads with ${productFacts.calibrationMinImpressions.toLocaleString("en-GB")} or more impressions each. Below that, it says there isn't enough data yet instead of showing a number. When you re-import, the newest numbers replace the old ones.`,
    ],
  },
  {
    id: "data",
    title: "Your data",
    body: [
      <>
        Your brand kit, references, creatives and imported results belong to
        your account and aren&apos;t shared with other users. Application data
        is hosted on infrastructure operated for Digiteq Holdings Limited.
        Details are in our{" "}
        <Link href={routes.privacy} className="text-accent underline underline-offset-4">
          privacy policy
        </Link>
        , and you can ask us to export or delete your data at{" "}
        <a href={`mailto:${CONTACT.hello}`} className="text-accent underline underline-offset-4">
          {CONTACT.hello}
        </a>
        .
      </>,
    ],
  },
];

export default function TrustPage() {
  return (
    <MarketingShell>
      <Section className="pt-14 md:pt-20">
        <Breadcrumbs
          items={[
            { label: "Home", href: routes.home },
            { label: "How we measure" },
          ]}
        />
        <div className="mt-6 grid gap-12 lg:grid-cols-[220px_1fr]">
          <nav aria-label="On this page" className="hidden lg:block">
            <ul className="sticky top-24 space-y-2 border-l border-line text-sm">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="-ml-px block border-l-2 border-transparent pl-4 text-ink-tertiary hover:border-accent hover:text-ink"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <Eyebrow>How we measure</Eyebrow>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
              Every number, and when it stays blank.
            </h1>
            <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-secondary">
              Ad tools are full of confident scores nobody can check. This page
              explains where ours come from, so you can decide how much weight
              to give them.
            </p>
            <div className="mt-12 max-w-2xl space-y-12">
              {SECTIONS.map((s) => (
                <section key={s.id} id={s.id} className="scroll-mt-24">
                  <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
                    {s.title}
                  </h2>
                  <div className="mt-3 space-y-3 leading-relaxed text-ink-secondary">
                    {s.body.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </Section>
      <FinalCtaBand
        title="Questions about a number?"
        subtitle="Email us. We'll explain how it was worked out, or fix it if it's wrong."
        cta={`Email ${CONTACT.hello}`}
        href={`mailto:${CONTACT.hello}`}
        secondary={{ href: routes.platform, label: "See the product" }}
      />
    </MarketingShell>
  );
}
