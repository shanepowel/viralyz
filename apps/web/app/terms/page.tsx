import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <span className="eyebrow">Legal</span>
          <h1>Terms of service.</h1>
          <p>
            The agreement between you and us. Last updated July 2026.
          </p>
        </div>
        <div className="legal-body">
          <p className="legal-note">
            TEMPLATE SHELL. Structure is final; wording must be reviewed by a
            solicitor before launch.
          </p>
          <h3>1. Who you are dealing with</h3>
          <p>
            Viralyz is a product of Digiteq Holdings Limited, registered in
            England and Wales. [Company number and registered address to be
            inserted.] These terms are governed by the laws of England and Wales.
          </p>
          <h3>2. Your account</h3>
          <p>
            You must be at least 18, give accurate details, and keep your login
            safe. One person per account unless you are on a team plan.
          </p>
          <h3>3. Your content</h3>
          <p>
            Everything you upload stays yours. You give us permission to process
            it so we can score it and provide the service. We never use your
            content to promote Viralyz without asking you first.
          </p>
          <h3>4. Scores and predictions</h3>
          <p>
            Scores are predictions, not promises. We show our accuracy honestly
            and it will never be 100%. You are responsible for what you post.
          </p>
          <h3>5. Fair use</h3>
          <p>
            Do not use Viralyz to break platform rules, mislead people, harass
            anyone, or scrape our data. We can suspend accounts that do.
          </p>
          <h3>6. Payments and plans</h3>
          <p>
            Plans renew until you cancel. Cancel any time; you keep access until
            the end of the period you paid for. [Refund terms to be completed with
            legal review.]
          </p>
          <h3>7. Packages and orders</h3>
          <p>
            When a brand buys a package, the money is held by us and released when
            the work is delivered and approved. Fees are shown before anyone pays.
            [Full marketplace terms to be completed before packages launch.]
          </p>
          <h3>8. Liability</h3>
          <p>
            [Limitation of liability, warranties and indemnities to be completed
            with legal review.]
          </p>
          <h3>9. Ending the agreement</h3>
          <p>
            You can leave any time by deleting your account. We can end the
            agreement with notice if you break these terms.
          </p>
        </div>
      </div>
    </MarketingShell>
  );
}
