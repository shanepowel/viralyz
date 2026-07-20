"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { APP_NAME } from "@repo/config";
import {
  chromeLinks,
  mainNav,
  type NavLink,
  type NavSection,
} from "@/config/nav";
import { ThemeToggle } from "@/components/marketing/theme-toggle";

function MegaItem({
  link,
  onNavigate,
}: {
  link: NavLink;
  onNavigate?: () => void;
}) {
  const inner = (
    <>
      <span className="txt">
        <strong>{link.label}</strong>
        {link.desc ? <span>{link.desc}</span> : null}
      </span>
    </>
  );
  if (link.external) {
    return (
      <a className="mega-link" href={link.href} onClick={onNavigate}>
        {inner}
      </a>
    );
  }
  return (
    <Link className="mega-link" href={link.href} onClick={onNavigate}>
      {inner}
    </Link>
  );
}

function NavGroupMenu({
  section,
  open,
  onOpen,
  onClose,
}: {
  section: NavSection;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  if (!section.groups?.length) {
    return (
      <Link
        href={section.href}
        className="nav-trigger"
        style={{ textDecoration: "none", display: "inline-flex" }}
      >
        {section.label}
      </Link>
    );
  }

  return (
    <div
      className={`nav-item${open ? " is-open" : ""}`}
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onFocusCapture={onOpen}
    >
      <Link
        href={section.href}
        className="nav-trigger"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {section.label}
        <span className="caret" aria-hidden />
      </Link>
      <div className="mega" role="menu" aria-label={section.label}>
        {section.groups.map((col) => (
          <div className="mega-col" key={col.heading}>
            <h5>{col.heading}</h5>
            {col.links.map((link) => (
              <MegaItem key={link.label} link={link} onNavigate={onClose} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SiteNav() {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleId = useId();
  const navRef = useRef<HTMLElement>(null);

  const closeMega = () => setOpenGroup(null);
  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenGroup(null);
        setMobileOpen(false);
      }
    }
    function onPointer(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, []);

  return (
    <>
      <nav className="nav" ref={navRef}>
        <Link href="/" className="brand" onClick={closeMobile}>
          <span className="mark" aria-hidden />
          {APP_NAME}
        </Link>
        <div className="nav-links">
          {mainNav.map((section) => (
            <NavGroupMenu
              key={section.label}
              section={section}
              open={openGroup === section.label}
              onOpen={() => setOpenGroup(section.label)}
              onClose={closeMega}
            />
          ))}
        </div>

        <div className="nav-actions">
          <ThemeToggle />
          <a href={chromeLinks.signIn} className="signin">
            Sign in
          </a>
          <a href={chromeLinks.startFree} className="btn btn-primary">
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
        checked={mobileOpen}
        onChange={(e) => setMobileOpen(e.target.checked)}
      />
      <div className="mobile-panel">
        {mainNav.map((section) =>
          section.groups?.length ? (
            <details className="m-group" key={section.label}>
              <summary>{section.label}</summary>
              <div className="m-sub">
                <Link href={section.href} onClick={closeMobile}>
                  Overview
                </Link>
                {section.groups.flatMap((col) =>
                  col.links.map((link) =>
                    link.external ? (
                      <a
                        key={`${section.label}-${link.label}`}
                        href={link.href}
                        onClick={closeMobile}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={`${section.label}-${link.label}`}
                        href={link.href}
                        onClick={closeMobile}
                      >
                        {link.label}
                      </Link>
                    ),
                  ),
                )}
              </div>
            </details>
          ) : (
            <Link
              key={section.label}
              href={section.href}
              className="m-plain"
              onClick={closeMobile}
            >
              {section.label}
            </Link>
          ),
        )}
        <div className="m-actions">
          <a
            href={chromeLinks.signIn}
            className="btn btn-ghost"
            onClick={closeMobile}
          >
            Sign in
          </a>
          <a
            href={chromeLinks.startFree}
            className="btn btn-primary"
            onClick={closeMobile}
          >
            Start free
          </a>
          <a
            href={chromeLinks.scoreVideo}
            className="btn btn-ghost"
            onClick={closeMobile}
          >
            Score a video
          </a>
        </div>
      </div>
    </>
  );
}
