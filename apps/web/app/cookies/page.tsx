"use client";

import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { openCookieSettings } from "@/components/marketing/cookie-banner";
import { routes } from "@/lib/site";

export default function CookiesPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <span className="eyebrow">Legal</span>
          <h1>Cookie policy</h1>
          <p>
            What we store on your device, why, and how to say no. Last updated
            July 2026.
          </p>
        </div>
        <div className="legal-body">
          <h3>1. What cookies are</h3>
          <p>
            Small files stored on your device that help websites work and
            remember preferences. Some are essential; some are optional.
          </p>
          <h3>2. Essential cookies</h3>
          <p>
            These keep sessions secure and remember your cookie choices. They
            are always on because the site needs them to function.
          </p>
          <h3>3. Analytics cookies (optional)</h3>
          <p>
            If we enable analytics, they help us understand which pages people
            use. You can refuse optional cookies and the site still works. We do
            not load optional analytics until you opt in via the consent banner.
          </p>
          <h3>4. Manage choices</h3>
          <p>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => openCookieSettings()}
            >
              Open cookie settings
            </button>
          </p>
          <h3>5. More</h3>
          <p>
            See our <Link href={routes.privacy}>privacy policy</Link> for how we
            handle personal data.
          </p>
        </div>
      </div>
    </MarketingShell>
  );
}
