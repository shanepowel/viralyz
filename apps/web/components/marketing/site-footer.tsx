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
            <Link href="/browse">Browse creators</Link>
            <Link href="/tools">Free tools</Link>
            <Link href="/report">Viral Score Report</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/brands">For brands</Link>
          </div>
          <div>
            <h5>Company</h5>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/affiliates">Affiliates</Link>
          </div>
          <div>
            <h5>Legal</h5>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/cookies">Cookies</Link>
          </div>
        </div>
        <div className="foot-bottom">
          <span>
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </span>
          <span className="digiteq-line">
            <span className="dq">D</span>A Digiteq Holdings company · Windsor, UK
          </span>
        </div>
      </div>
    </footer>
  );
}
