import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { LegalTemplate } from "@/components/legal/LegalTemplate";
import { LEGAL_UPDATED, termsSections } from "@/data/legal";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";
import { fetchSanity } from "@/sanity/lib/fetch";
import { LEGAL_PAGE_QUERY } from "@/sanity/lib/queries";

export const metadata: Metadata = pageMeta({
  title: "Terms of service",
  description: "Terms for using Viralyz.",
  path: routes.terms,
});

export default async function TermsPage() {
  const doc = await fetchSanity<{
    title: string;
    lastUpdated?: string;
    body?: unknown;
  }>({
    query: LEGAL_PAGE_QUERY,
    params: { slug: "terms" },
    published: true,
    stega: false,
  });

  return (
    <MarketingShell>
      <LegalTemplate
        title={doc?.title ?? "Terms of service"}
        lastUpdated={doc?.lastUpdated ?? LEGAL_UPDATED}
        body={doc?.body}
        sections={termsSections}
      />
    </MarketingShell>
  );
}
