import Link from "next/link";
import { APP_NAME } from "@repo/config";
import { getFooterColumns } from "@/config/nav";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const columns = getFooterColumns();

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
        </div>
      </div>
    </footer>
  );
}
