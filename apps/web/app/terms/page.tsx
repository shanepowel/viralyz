import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <span className="eyebrow">Legal</span>
          <h1>Terms</h1>
          <p>
            Simple terms for a simple product. Full legal terms are on the way.
          </p>
        </div>
        <div className="about-body" style={{ paddingBottom: 96 }}>
          <p>
            Questions? Email{" "}
            <a href="mailto:hello@viralyz.com" style={{ color: "var(--violet-deep)" }}>
              hello@viralyz.com
            </a>
            .
          </p>
        </div>
      </div>
    </MarketingShell>
  );
}
