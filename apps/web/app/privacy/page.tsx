import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Privacy policy",
  description:
    "How Digiteq Holdings Limited handles personal data for Viralyz.",
  path: routes.privacy,
});

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <span className="eyebrow">Legal</span>
          <h1>Privacy policy</h1>
          <p>
            How we handle your data. Last updated July 2026. Controller: Digiteq
            Holdings Limited, Windsor, United Kingdom.
          </p>
        </div>
        <div className="legal-body">
          <h3>1. Who we are</h3>
          <p>
            Viralyz is operated by Digiteq Holdings Limited (&quot;Digiteq&quot;,
            &quot;we&quot;, &quot;us&quot;), a company registered in England and
            Wales, based in Windsor, United Kingdom. Digiteq is the data
            controller for the personal data described in this notice. Contact:{" "}
            <a href="mailto:privacy@viralyz.com">privacy@viralyz.com</a>.
          </p>
          <h3>2. What we collect</h3>
          <p>
            Account details you give us (name, email, handle). Content you
            upload for scoring. Data from social platforms you connect, fetched
            through their official channels with your permission. Payment
            details when payments are live, handled by our payment processor and
            not stored as full card numbers by us. Usage data about how you use
            the product.
          </p>
          <h3>3. Why we collect it (lawful bases)</h3>
          <p>
            Contract: to provide scoring, profiles and related services you
            request. Legitimate interests: to secure the service, improve
            product quality, and understand aggregate usage. Consent: where we
            ask for optional analytics or marketing. Legal obligation: where the
            law requires us to retain or disclose information.
          </p>
          <h3>4. How long we keep it</h3>
          <p>
            Account data for as long as your account is active and for a
            reasonable period afterward to close the account and meet legal
            duties. Uploaded content until you delete it or close your account,
            subject to backup cycles. Analytics events in aggregated or
            pseudonymous form for product improvement.
          </p>
          <h3>5. Sharing</h3>
          <p>
            We use processors for hosting, email, and (when live) payments.
            Brands only see what you choose to publish on your public profile or
            media kit. We do not sell personal data.
          </p>
          <h3>6. Your rights</h3>
          <p>
            Under UK GDPR you can request access, correction, deletion,
            restriction, portability, and object to certain processing. You may
            withdraw consent where processing is consent-based. Subject access
            and related requests:{" "}
            <a href="mailto:privacy@viralyz.com">privacy@viralyz.com</a>. You
            can complain to the ICO (ico.org.uk).
          </p>
          <h3>7. International transfers</h3>
          <p>
            If we transfer data outside the UK, we use appropriate safeguards
            such as the UK International Data Transfer Agreement or adequacy
            decisions.
          </p>
          <h3>8. Cookies</h3>
          <p>
            See our <Link href={routes.cookies}>cookie policy</Link> for what we
            store on your device and how to manage choices.
          </p>
          <h3>9. Changes</h3>
          <p>
            We will update this page when our practices change and note the
            revision date above.
          </p>
        </div>
      </div>
    </MarketingShell>
  );
}
