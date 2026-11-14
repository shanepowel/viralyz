import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SafeZoneChecker } from "@/components/tools/SafeZoneChecker";
import { liveTools } from "@/data/tools";
import { pageMeta } from "@/lib/meta";
import { productFacts, routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Free tools",
  description:
    "A safe-zone checker and an ad readability checker. They run in your browser, with no account and nothing uploaded.",
  path: routes.tools,
});

export default function ToolsPage() {
  const tools = liveTools();

  return (
    <MarketingShell>
      <Container className="pb-20 pt-[clamp(40px,6vw,80px)]">
        <SectionHeader
          as="h1"
          eyebrow="Free tools"
          title="Two checks you can run right now"
          lede="No account. Your image stays in your browser and is never uploaded."
        />
        <ul className="m-0 grid list-none grid-cols-1 gap-x-8 border-t border-rule p-0 sm:grid-cols-2">
          {tools.map((t, i) => (
            <li key={t.slug} className="border-b border-line">
              <Link href={`/tools/${t.slug}`} className="group block py-6">
                <p className="kicker m-0">Tool {i + 1} / free</p>
                <h2 className="m-0 mt-2 font-display text-[30px] group-hover:underline group-hover:underline-offset-4">
                  {t.name}
                </h2>
                <p className="m-0 mt-2 max-w-[480px] text-ink-2">{t.description}</p>
              </Link>
            </li>
          ))}
        </ul>

        <SectionHeader className="mt-20" eyebrow="Try one now" title="Safe-zone checker" />
        <SafeZoneChecker />
      </Container>

      <FinalCta
        title="These check one thing. Pre-flight checks the lot."
        subtitle={`${productFacts.freeCredits} free credits. Every ad you make is measured against five rules before you spend on it.`}
        cta="Check a full ad free"
        href={routes.signup}
      />
    </MarketingShell>
  );
}
