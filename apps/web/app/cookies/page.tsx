"use client";

import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { openCookieSettings } from "@/components/marketing/cookie-banner";

export default function CookiesPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <span className="eyebrow">Legal</span>
          <h1>Cookie policy.</h1>
          <p>
            What we store on your device, why, and how to say no. Last updated
            July 2026.
          </p>
        </div>
        <div className="legal-body">
          <p className="legal-note">
            TEMPLATE SHELL. Cookie names and providers to be finalised against
            the production build before launch.
          </p>
          <h3>1. What cookies are</h3>
          <p>
            Small files stored on your device that help websites work and
            remember things. Some are essential, some are optional.
          </p>
          <h3>2. Essential cookies</h3>
          <p>
            These keep you signed in, keep the site secure, and remember your
            cookie choices. They are always on because the site does not work
            without them.
          </p>
          <h3>3. Analytics cookies (optional)</h3>
          <p>
            These help us understand which pages people use so we can improve
            them. We use privacy-respecting analytics. You can turn these off and
            everything still works.
          </p>
          <h3>4. Marketing cookies (optional)</h3>
          <p>
            These help us measure whether our advertising works. Off by default
            until you say yes.
          </p>
          <h3>5. Your choices</h3>
          <p>
            You chose when you first visited, and you can change your mind any
            time:{" "}
            <button
              type="button"
              onClick={() => openCookieSettings()}
              style={{
                color: "var(--violet-deep)",
                background: "none",
                border: "none",
                cursor: "pointer",
                font: "inherit",
                padding: 0,
              }}
            >
              open cookie settings
            </button>
            . You can also clear cookies in your browser at any time. See also
            our{" "}
            <Link href="/privacy" style={{ color: "var(--violet-deep)" }}>
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </MarketingShell>
  );
}
