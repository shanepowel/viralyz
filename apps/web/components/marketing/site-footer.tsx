import Link from "next/link";
import { APP_NAME } from "@repo/config";
import { ImageSlot } from "@/components/marketing/image-slot";
import { getMarketingFooterColumns } from "@/components/marketing/nav-data";

const SOCIAL = [
  { label: "Tk", href: "https://www.tiktok.com", name: "TikTok" },
  { label: "Yt", href: "https://www.youtube.com", name: "YouTube" },
  { label: "Ig", href: "https://www.instagram.com", name: "Instagram" },
  { label: "X", href: "https://x.com", name: "X" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();
  const columns = getMarketingFooterColumns();

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
          {columns.map((col) => (
            <div className="foot-col" key={col.heading}>
              <h4>{col.heading}</h4>
              {col.links.map((link) =>
                link.external ? (
                  <a key={link.label} href={link.href}>
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.label} href={link.href}>
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          ))}
        </div>
        <div className="foot-bottom">
          <span>
            © {year} {APP_NAME}. All rights reserved.
            <span className="digiteq-line">
              {" "}
              · A Digiteq Holdings company · Windsor, UK
            </span>
          </span>
          <div className="social">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
