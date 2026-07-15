import Link from "next/link";
import { APP_NAME, getPublicAppPath } from "@repo/config";
import { ImageSlot } from "@/components/marketing/image-slot";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link href="/" className="brand">
              <span className="mark" aria-hidden />
              {APP_NAME}
            </Link>
            <p>
              Score your content before you post it. Build a record brands can
              trust.
            </p>
            <div className="logostrip-row">
              <ImageSlot id="foot-logo-1" shape="rect" label="Logo" />
              <ImageSlot id="foot-logo-2" shape="rect" label="Logo" />
              <ImageSlot id="foot-logo-3" shape="rect" label="Logo" />
            </div>
          </div>
          <div className="foot-col">
            <h4>Platform</h4>
            <a href={getPublicAppPath("/analyze")}>Video scoring</a>
            <a href={getPublicAppPath("/hook-lab")}>Hook tester</a>
            <a href={getPublicAppPath("/caption-studio")}>Teleprompter</a>
            <a href={getPublicAppPath("/thumbnails")}>Thumbnail tests</a>
          </div>
          <div className="foot-col">
            <h4>Creators</h4>
            <Link href="/for-creators">Verified profile</Link>
            <a href={getPublicAppPath("/")}>Media kit builder</a>
            <Link href="/tools/engagement-calculator">Rate calculator</Link>
            <Link href="/blog">Academy</Link>
          </div>
          <div className="foot-col">
            <h4>Brands</h4>
            <Link href="/creators">Search creators</Link>
            <Link href="/for-brands">Campaign manager</Link>
            <Link href="/for-brands">Case studies</Link>
            <Link href="/contact">Agencies</Link>
          </div>
          <div className="foot-col">
            <h4>Resources</h4>
            <Link href="/blog">Blog</Link>
            <Link href="/contact">Help center</Link>
            <Link href="/platform">API docs</Link>
            <Link href="/about">Status</Link>
          </div>
          <div className="foot-col">
            <h4>Company</h4>
            <Link href="/about">About</Link>
            <Link href="/affiliates">Affiliates</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
        <div className="foot-bottom">
          <span>
            © {year} {APP_NAME}. All rights reserved.
            <span className="digiteq-line">
              {" "}
              · A Digiteq Holdings company · Windsor, UK
            </span>
          </span>
          <div className="social" aria-hidden>
            <span>Tk</span>
            <span>Yt</span>
            <span>Ig</span>
            <span>X</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
