import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { LegalTemplate } from "@/components/legal/LegalTemplate";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";
import { fetchSanity } from "@/sanity/lib/fetch";
import { LEGAL_PAGE_QUERY } from "@/sanity/lib/queries";

export const metadata: Metadata = pageMeta({
  title: "Cookies",
  description: "How Viralyz uses cookies and analytics.",
  path: routes.cookies,
});

export default async function CookiesPage() {
  const doc = await fetchSanity<{
    title: string;
    lastUpdated?: string;
    body?: unknown;
  }>({
    query: LEGAL_PAGE_QUERY,
    params: { slug: "cookies" },
    published: true,
    stega: false,
  });

  return (
    <MarketingShell>
      <LegalTemplate
        title={doc?.title ?? "Cookies"}
        lastUpdated={doc?.lastUpdated}
        body={doc?.body}
        fallback={
          <div className="prose-vz space-y-4">
            <p>
              We use Plausible Analytics, which is cookieless. Essential cookies
              keep you signed in on the product app.
            </p>
          </div>
        }
      />
    </MarketingShell>
  );
}
