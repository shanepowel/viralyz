import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <span className="eyebrow">Legal</span>
          <h1>Privacy policy.</h1>
          <p>
            The plain English version of how we handle your data. Last updated
            July 2026.
          </p>
        </div>
        <div className="legal-body">
          <p className="legal-note">
            TEMPLATE SHELL. Structure is final; wording must be reviewed by a
            solicitor before launch.
          </p>
          <h3>1. Who we are</h3>
          <p>
            Viralyz is operated by Digiteq Holdings Limited, a company registered
            in England and Wales, based in Windsor, United Kingdom. Digiteq is
            the data controller for the personal data described here. [Company
            number and registered address to be inserted.]
          </p>
          <h3>2. What we collect</h3>
          <p>
            Account details you give us (name, email, handle). Content you upload
            for scoring. Data from social platforms you connect, fetched through
            their official channels with your permission. Payment details, handled
            by Stripe, never stored by us. Usage data about how you use the app.
          </p>
          <h3>3. Why we collect it</h3>
          <p>
            To score your content, to learn what works for your audience, to build
            your verified media kit if you publish one, to process payments, to
            keep the service secure, and to improve the product. We do not sell
            your data. We do not show your private numbers to anyone unless you
            publish them.
          </p>
          <h3>4. Legal bases</h3>
          <p>
            [To be completed with legal review: contract performance, legitimate
            interests, consent for marketing and non-essential cookies.]
          </p>
          <h3>5. Who we share it with</h3>
          <p>
            Service providers who help us run Viralyz (hosting, payments, email,
            analytics), each under contract. Social platforms, only to do what you
            asked. Nobody else, unless the law requires it.
          </p>
          <h3>6. How long we keep it</h3>
          <p>
            While your account is active. If you delete your account, everything
            is removed within 14 days, except records we must keep by law.
          </p>
          <h3>7. Your rights</h3>
          <p>
            You can see, export, correct or delete your data at any time from
            Settings, or by emailing privacy@viralyz.com. You can complain to the
            Information Commissioner&apos;s Office if you are unhappy with how we
            respond.
          </p>
          <h3>8. Cookies</h3>
          <p>
            See our{" "}
            <Link href="/cookies" style={{ color: "var(--violet-deep)" }}>
              cookie policy
            </Link>{" "}
            for the full list and your choices.
          </p>
          <h3>9. Changes</h3>
          <p>
            If we change this policy in a way that matters, we will tell you by
            email before the change takes effect.
          </p>
        </div>
      </div>
    </MarketingShell>
  );
}
