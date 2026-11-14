import type { Metadata } from "next";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { changelog } from "@/data/changelog";
import { formatPostDate } from "@/lib/blog";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Changelog",
  description: "What has shipped in Viralyz, with dates.",
  path: routes.changelog,
});

export default function ChangelogPage() {
  return (
    <MarketingShell>
      <Container className="pb-20 pt-[clamp(40px,6vw,80px)]">
        <SectionHeader
          as="h1"
          eyebrow="Changelog"
          title="What shipped, and when"
          lede="Dated notes on changes to the product. Nothing appears here before it is live."
        />
        <ol className="m-0 list-none border-t border-rule p-0">
          {changelog.map((entry) => (
            <li key={entry.date + entry.title} className="grid grid-cols-1 gap-x-8 gap-y-2 border-b border-line py-8 md:grid-cols-[200px_1fr]">
              <time dateTime={entry.date} className="pt-1.5 font-mono text-[13px] text-muted">
                {formatPostDate(entry.date)}
              </time>
              <div className="max-w-[720px]">
                <h2 className="m-0 font-display text-[28px]">{entry.title}</h2>
                <ul className="m-0 mt-4 list-none p-0">
                  {entry.changes.map((c) => (
                    <li key={c} className="border-t border-line py-2.5 text-ink-2">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </Container>
      <FinalCta title="See it for yourself." subtitle="10 free credits. One credit per ad." tone="panel" />
    </MarketingShell>
  );
}
