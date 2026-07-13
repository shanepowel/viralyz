import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <span className="eyebrow">Legal</span>
          <h1>Privacy</h1>
          <p>
            Your content and numbers belong to you. You can export or delete
            everything at any time. We never sell your data, and brands only see
            what you choose to publish on your media kit.
          </p>
        </div>
        <div className="about-body" style={{ paddingBottom: 96 }}>
          <p>
            Full privacy policy coming soon. For questions, email{" "}
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
