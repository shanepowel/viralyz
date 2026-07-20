import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { LegalTemplate } from "@/components/legal/LegalTemplate";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";
import { fetchSanity } from "@/sanity/lib/fetch";
import { LEGAL_PAGE_QUERY } from "@/sanity/lib/queries";

export const metadata: Metadata = pageMeta({
  title: "Privacy policy",
  description:
    "How Digiteq Holdings Limited handles personal data for Viralyz.",
  path: routes.privacy,
});

export default async function PrivacyPage() {
  const doc = await fetchSanity<{
    title: string;
    lastUpdated?: string;
    body?: unknown;
  }>({
    query: LEGAL_PAGE_QUERY,
    params: { slug: "privacy" },
    published: true,
    stega: false,
  });

  return (
    <MarketingShell>
      <LegalTemplate
        title={doc?.title ?? "Privacy policy"}
        lastUpdated={doc?.lastUpdated}
        body={doc?.body}
        fallback={
          <div className="prose-vz space-y-4">
            <p>
              Viralyz is operated by Digiteq Holdings Limited. We process
              account data, connected platform metrics, and content you upload
              to score.
            </p>
            <p>
              You can export or delete your data from settings. Contact
              hello@viralyz.com for privacy requests.
            </p>
          </div>
        }
      />
    </MarketingShell>
  );
}
