import Link from "next/link";
import { APP_NAME } from "@repo/config";

export function SiteFooter() {
  return (
    <footer className="vz-footer">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link href="/" className="logo" style={{ fontSize: 16 }}>
              <span
                className="logo-ring"
                style={{ width: 18, height: 18, borderWidth: 2.5 }}
                aria-hidden
              />
              {APP_NAME}
            </Link>
            <p>
              Score your content before you post it. Build a record brands can
              trust.
            </p>
          </div>
          <div>
            <h5>Product</h5>
            <Link href="/platform">Platform</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/brands">For brands</Link>
          </div>
          <div>
            <h5>Company</h5>
            <Link href="/about">About</Link>
            <a href="mailto:hello@viralyz.com">Contact</a>
            <span style={{ display: "block", padding: "4px 0", color: "var(--ink-3)" }}>
              Blog
            </span>
          </div>
          <div>
            <h5>Legal</h5>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <span style={{ display: "block", padding: "4px 0", color: "var(--ink-3)" }}>
              Cookies
            </span>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</span>
          <span className="digiteq-line">
            <span className="dq">D</span>A Digiteq Holdings company · Windsor, UK
          </span>
        </div>
      </div>
    </footer>
  );
}
