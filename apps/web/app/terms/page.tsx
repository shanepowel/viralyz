import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Terms of service",
  description: "Terms for using Viralyz, operated by Digiteq Holdings Limited.",
  path: routes.terms,
});

export default function TermsPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <span className="eyebrow">Legal</span>
          <h1>Terms of service</h1>
          <p>
            The rules for using Viralyz. Last updated July 2026. Operated by
            Digiteq Holdings Limited, Windsor, UK.
          </p>
        </div>
        <div className="legal-body">
          <h3>1. Agreement</h3>
          <p>
            By using Viralyz you agree to these terms. If you use Viralyz for an
            organisation, you confirm you have authority to bind that
            organisation.
          </p>
          <h3>2. The service</h3>
          <p>
            Viralyz provides content scoring tools, creator profiles, and related
            features. Scores are estimates based on models and data available at
            the time. They are not guarantees of reach, revenue, or brand deals.
          </p>
          <h3>3. Accounts</h3>
          <p>
            Keep your login secure. You are responsible for activity under your
            account. Provide accurate information. You must be at least 16 (or
            the age of digital consent in your country).
          </p>
          <h3>4. Acceptable use</h3>
          <p>
            Do not upload unlawful content, attempt to break or overload the
            service, scrape in ways that violate platform rules, or misuse
            another person&apos;s data. Follow TikTok, YouTube, Instagram and X
            rules when connecting accounts or automating engagement.
          </p>
          <h3>5. Your content</h3>
          <p>
            You keep ownership of content you upload. You grant us a licence to
            process it to provide scoring and related features. Public profile
            and media kit fields you choose to publish are visible to others.
          </p>
          <h3>6. Fees</h3>
          <p>
            Free and paid plans are described on the pricing page. Paid plans
            renew monthly until cancelled. Fees are in GBP unless stated
            otherwise. When marketplace payments launch, brand fees and creator
            payouts will be disclosed at checkout.
          </p>
          <h3>7. Disclaimers</h3>
          <p>
            The service is provided on an &quot;as is&quot; basis. We do not
            warrant uninterrupted availability or that scores will match future
            platform performance.
          </p>
          <h3>8. Liability</h3>
          <p>
            Nothing in these terms limits liability that cannot be limited under
            UK law. Subject to that, Digiteq&apos;s aggregate liability for
            claims arising from the service is limited to the fees you paid us
            in the 12 months before the claim.
          </p>
          <h3>9. Governing law</h3>
          <p>
            These terms are governed by the laws of England and Wales. Courts of
            England and Wales have exclusive jurisdiction, without prejudice to
            mandatory consumer protections where you live.
          </p>
          <h3>10. Contact</h3>
          <p>
            Questions:{" "}
            <a href="mailto:hello@viralyz.com">hello@viralyz.com</a>. Digiteq
            Holdings Limited, Windsor, United Kingdom.
          </p>
        </div>
      </div>
    </MarketingShell>
  );
}
