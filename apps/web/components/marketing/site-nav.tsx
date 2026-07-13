"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { APP_NAME, getPublicAppUrl, getPublicLoginUrl } from "@repo/config";

const LINKS = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  {
    href: "/platform",
    label: "Platform",
    match: (p: string) => p.startsWith("/platform"),
  },
  {
    href: "/browse",
    label: "Browse creators",
    match: (p: string) => p.startsWith("/browse"),
  },
  {
    href: "/tools",
    label: "Free tools",
    match: (p: string) => p.startsWith("/tools"),
  },
  {
    href: "/brands",
    label: "For brands",
    match: (p: string) => p.startsWith("/brands"),
  },
  {
    href: "/blog",
    label: "Blog",
    match: (p: string) => p.startsWith("/blog"),
  },
  {
    href: "/pricing",
    label: "Pricing",
    match: (p: string) => p.startsWith("/pricing"),
  },
  {
    href: "/about",
    label: "About",
    match: (p: string) => p.startsWith("/about"),
  },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const appUrl = getPublicAppUrl();
  const loginUrl = getPublicLoginUrl();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`vz-nav${scrolled ? " scrolled" : ""}`} id="nav">
      <div className="vz-nav-inner">
        <Link href="/" className="logo">
          <span className="logo-ring" aria-hidden />
          {APP_NAME}
        </Link>
        <div className="vz-nav-links">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={link.match(pathname) ? "active" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="vz-nav-cta">
          <Link className="btn btn-ghost" href={loginUrl}>
            Sign in
          </Link>
          <Link className="btn btn-primary" href={appUrl}>
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}
