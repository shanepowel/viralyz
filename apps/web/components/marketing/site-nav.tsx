"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  APP_NAME,
  getPublicAppPath,
  getPublicAppUrl,
  getPublicLoginUrl,
} from "@repo/config";
import { ImageSlot } from "@/components/marketing/image-slot";
import { ThemeToggle } from "@/components/marketing/theme-toggle";

type MegaLink = {
  href: string;
  ico: string;
  title: string;
  desc: string;
  external?: boolean;
};

function MegaItem({ link }: { link: MegaLink }) {
  const inner = (
    <>
      <span className="ico">{link.ico}</span>
      <span className="txt">
        <strong>{link.title}</strong>
        <span>{link.desc}</span>
      </span>
    </>
  );
  if (link.external) {
    return (
      <a className="mega-link" href={link.href}>
        {inner}
      </a>
    );
  }
  return (
    <Link className="mega-link" href={link.href}>
      {inner}
    </Link>
  );
}

export function SiteNav() {
  const toggleId = useId();
  const [open, setOpen] = useState(false);
  const appUrl = getPublicAppUrl();
  const loginUrl = getPublicLoginUrl();

  const platformLinks: MegaLink[] = [
    {
      href: getPublicAppPath("/analyze"),
      ico: "Sc",
      title: "Video scoring",
      desc: "Score out of 100 in 30 seconds",
      external: true,
    },
    {
      href: getPublicAppPath("/hook-lab"),
      ico: "Hk",
      title: "Hook tester",
      desc: "Ten opening lines, ranked",
      external: true,
    },
    {
      href: getPublicAppPath("/caption-studio"),
      ico: "Tp",
      title: "Teleprompter",
      desc: "Script feedback while you record",
      external: true,
    },
    {
      href: getPublicAppPath("/thumbnails"),
      ico: "Th",
      title: "Thumbnail tests",
      desc: "Compare against your feed rivals",
      external: true,
    },
    {
      href: getPublicAppPath("/"),
      ico: "An",
      title: "Analytics",
      desc: "Track score trends over time",
      external: true,
    },
    {
      href: "/platform",
      ico: "Ap",
      title: "Integrations",
      desc: "TikTok, YouTube, Instagram, X",
    },
  ];

  const creatorLinks: MegaLink[] = [
    {
      href: "/for-creators",
      ico: "Pr",
      title: "Verified profile",
      desc: "Real numbers, checked hourly",
    },
    {
      href: getPublicAppPath("/"),
      ico: "Mk",
      title: "Media kit builder",
      desc: "One link brands can trust",
      external: true,
    },
    {
      href: "/tools/engagement-calculator",
      ico: "Rt",
      title: "Rate calculator",
      desc: "Suggested rates by niche",
    },
    {
      href: "/blog",
      ico: "Ac",
      title: "Creator academy",
      desc: "Courses on scoring higher",
    },
    {
      href: "/for-creators",
      ico: "St",
      title: "Success stories",
      desc: "Creators booked through Viralyz",
    },
    {
      href: "/contact",
      ico: "Cm",
      title: "Community",
      desc: "Swap notes with other creators",
    },
  ];

  const brandLinks: MegaLink[] = [
    {
      href: "/creators",
      ico: "Se",
      title: "Search creators",
      desc: "Filter by niche, score, platform",
    },
    {
      href: "/for-brands",
      ico: "Cg",
      title: "Campaign manager",
      desc: "Brief, book, and pay in one place",
    },
    {
      href: "/for-brands",
      ico: "Vd",
      title: "Verified data",
      desc: "No self-reported follower counts",
    },
    {
      href: "/for-brands",
      ico: "Cs",
      title: "Case studies",
      desc: "Real campaign results",
    },
    {
      href: "/contact",
      ico: "Ag",
      title: "Agencies",
      desc: "Manage multiple client rosters",
    },
  ];

  const resourceLinks: MegaLink[] = [
    {
      href: "/blog",
      ico: "Bl",
      title: "Blog",
      desc: "Scoring breakdowns & case studies",
    },
    {
      href: "/contact",
      ico: "He",
      title: "Help center",
      desc: "Guides and how-tos",
    },
    {
      href: "/platform",
      ico: "Ap",
      title: "API docs",
      desc: "Pull scores into your own tools",
    },
    {
      href: "/about",
      ico: "St",
      title: "Status",
      desc: "Uptime and incident history",
    },
  ];

  const closeMobile = () => setOpen(false);

  return (
    <>
      <nav className="nav">
        <Link href="/" className="brand" onClick={closeMobile}>
          <span className="mark" aria-hidden />
          {APP_NAME}
        </Link>
        <div className="nav-links">
          <div className="nav-item">
            <button type="button" className="nav-trigger">
              Platform
              <span className="caret" />
            </button>
            <div className="mega">
              <div className="mega-col">
                <h5>Score &amp; fix</h5>
                {platformLinks.slice(0, 3).map((link) => (
                  <MegaItem key={link.title} link={link} />
                ))}
              </div>
              <div className="mega-col">
                <h5>Grow</h5>
                {platformLinks.slice(3).map((link) => (
                  <MegaItem key={link.title} link={link} />
                ))}
              </div>
              <div className="mega-feat">
                <ImageSlot
                  id="mega-platform"
                  shape="rect"
                  label="Product screenshot"
                />
                <div className="txt">
                  <strong>New: live score while recording</strong>
                  <span>See your number before you even post</span>
                </div>
              </div>
            </div>
          </div>

          <div className="nav-item">
            <button type="button" className="nav-trigger">
              For creators
              <span className="caret" />
            </button>
            <div className="mega">
              <div className="mega-col">
                <h5>Get discovered</h5>
                {creatorLinks.slice(0, 3).map((link) => (
                  <MegaItem key={link.title} link={link} />
                ))}
              </div>
              <div className="mega-col">
                <h5>Learn</h5>
                {creatorLinks.slice(3).map((link) => (
                  <MegaItem key={link.title} link={link} />
                ))}
              </div>
            </div>
          </div>

          <div className="nav-item">
            <button type="button" className="nav-trigger">
              For brands
              <span className="caret" />
            </button>
            <div className="mega">
              <div className="mega-col">
                <h5>Find talent</h5>
                {brandLinks.slice(0, 3).map((link) => (
                  <MegaItem key={link.title} link={link} />
                ))}
              </div>
              <div className="mega-col">
                <h5>Proof</h5>
                {brandLinks.slice(3).map((link) => (
                  <MegaItem key={link.title} link={link} />
                ))}
              </div>
            </div>
          </div>

          <div className="nav-item">
            <button type="button" className="nav-trigger">
              Resources
              <span className="caret" />
            </button>
            <div className="mega">
              <div className="mega-col">
                <h5>Learn</h5>
                {resourceLinks.slice(0, 2).map((link) => (
                  <MegaItem key={link.title} link={link} />
                ))}
              </div>
              <div className="mega-col">
                <h5>Build</h5>
                {resourceLinks.slice(2).map((link) => (
                  <MegaItem key={link.title} link={link} />
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/pricing"
            className="nav-trigger"
            style={{ textDecoration: "none", display: "inline-flex" }}
          >
            Pricing
          </Link>
        </div>

        <div className="nav-actions">
          <ThemeToggle />
          <a href={loginUrl} className="signin">
            Sign in
          </a>
          <a href={appUrl} className="btn btn-primary">
            Start free
          </a>
          <label className="hamburger" htmlFor={toggleId} aria-label="Menu">
            <span />
          </label>
        </div>
      </nav>

      <input
        type="checkbox"
        id={toggleId}
        className="nav-toggle"
        checked={open}
        onChange={(e) => setOpen(e.target.checked)}
      />
      <div className="mobile-panel">
        <details className="m-group">
          <summary>Platform</summary>
          <div className="m-sub">
            {platformLinks.map((link) =>
              link.external ? (
                <a key={link.title} href={link.href} onClick={closeMobile}>
                  {link.title}
                </a>
              ) : (
                <Link key={link.title} href={link.href} onClick={closeMobile}>
                  {link.title}
                </Link>
              ),
            )}
          </div>
        </details>
        <details className="m-group">
          <summary>For creators</summary>
          <div className="m-sub">
            {creatorLinks.map((link) =>
              link.external ? (
                <a key={link.title} href={link.href} onClick={closeMobile}>
                  {link.title}
                </a>
              ) : (
                <Link key={link.title} href={link.href} onClick={closeMobile}>
                  {link.title}
                </Link>
              ),
            )}
          </div>
        </details>
        <details className="m-group">
          <summary>For brands</summary>
          <div className="m-sub">
            {brandLinks.map((link) => (
              <Link key={link.title} href={link.href} onClick={closeMobile}>
                {link.title}
              </Link>
            ))}
          </div>
        </details>
        <details className="m-group">
          <summary>Resources</summary>
          <div className="m-sub">
            {resourceLinks.map((link) => (
              <Link key={link.title} href={link.href} onClick={closeMobile}>
                {link.title}
              </Link>
            ))}
          </div>
        </details>
        <Link href="/pricing" className="m-plain" onClick={closeMobile}>
          Pricing
        </Link>
        <div className="m-actions">
          <a href={loginUrl} className="btn btn-ghost" onClick={closeMobile}>
            Sign in
          </a>
          <a href={appUrl} className="btn btn-primary" onClick={closeMobile}>
            Start free
          </a>
        </div>
      </div>
    </>
  );
}
