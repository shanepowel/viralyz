"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  APP_NAME,
  getPublicAppPath,
  getPublicAppUrl,
  getPublicLoginUrl,
} from "@repo/config";
import { ImageSlot } from "@/components/marketing/image-slot";
import {
  getMarketingNavGroups,
  type NavGroup,
  type NavLink,
} from "@/components/marketing/nav-data";
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
      <span className="ico">{link.ico}</span>
      <span className="txt">
        <strong>{link.title}</strong>
        <span>{link.desc}</span>
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
  group,
  open,
  onOpen,
  onClose,
}: {
  group: NavGroup;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className={`nav-item${open ? " is-open" : ""}`}
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onFocusCapture={onOpen}
    >
      <Link
        href={group.href}
        className="nav-trigger"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {group.label}
        <span className="caret" aria-hidden />
      </Link>
      <div className="mega" role="menu" aria-label={group.label}>
        {group.columns.map((col) => (
          <div className="mega-col" key={col.heading}>
            <h5>{col.heading}</h5>
            {col.links.map((link) => (
              <MegaItem key={link.title} link={link} onNavigate={onClose} />
            ))}
          </div>
        ))}
        {group.feature ? (
          group.feature.external ? (
            <a
              className="mega-feat"
              href={group.feature.href}
              onClick={onClose}
            >
              <ImageSlot
                id={group.feature.slotId}
                shape="rect"
                label={group.feature.slotLabel}
              />
              <div className="txt">
                <strong>{group.feature.title}</strong>
                <span>{group.feature.desc}</span>
              </div>
            </a>
          ) : (
            <Link
              className="mega-feat"
              href={group.feature.href}
              onClick={onClose}
            >
              <ImageSlot
                id={group.feature.slotId}
                shape="rect"
                label={group.feature.slotLabel}
              />
              <div className="txt">
                <strong>{group.feature.title}</strong>
                <span>{group.feature.desc}</span>
              </div>
            </Link>
          )
        ) : null}
      </div>
    </div>
  );
}

export function SiteNav() {
  const toggleId = useId();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<NavGroup["id"] | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const groups = getMarketingNavGroups();
  const appUrl = getPublicAppUrl();
  const loginUrl = getPublicLoginUrl();

  const closeMobile = () => setMobileOpen(false);
  const closeMega = () => setOpenGroup(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenGroup(null);
        setMobileOpen(false);
      }
    };
    const onPointer = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    };
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
          {groups.map((group) => (
            <NavGroupMenu
              key={group.id}
              group={group}
              open={openGroup === group.id}
              onOpen={() => setOpenGroup(group.id)}
              onClose={closeMega}
            />
          ))}
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
        checked={mobileOpen}
        onChange={(e) => setMobileOpen(e.target.checked)}
      />
      <div className="mobile-panel">
        {groups.map((group) => (
          <details className="m-group" key={group.id}>
            <summary>{group.label}</summary>
            <div className="m-sub">
              <Link href={group.href} onClick={closeMobile}>
                Overview
              </Link>
              {group.columns.flatMap((col) =>
                col.links.map((link) =>
                  link.external ? (
                    <a
                      key={`${group.id}-${link.title}`}
                      href={link.href}
                      onClick={closeMobile}
                    >
                      {link.title}
                    </a>
                  ) : (
                    <Link
                      key={`${group.id}-${link.title}`}
                      href={link.href}
                      onClick={closeMobile}
                    >
                      {link.title}
                    </Link>
                  ),
                ),
              )}
              {group.feature ? (
                group.feature.external ? (
                  <a href={group.feature.href} onClick={closeMobile}>
                    {group.feature.title}
                  </a>
                ) : (
                  <Link href={group.feature.href} onClick={closeMobile}>
                    {group.feature.title}
                  </Link>
                )
              ) : null}
            </div>
          </details>
        ))}
        <Link href="/pricing" className="m-plain" onClick={closeMobile}>
          Pricing
        </Link>
        <Link href="/tools" className="m-plain" onClick={closeMobile}>
          Free tools
        </Link>
        <Link href="/contact" className="m-plain" onClick={closeMobile}>
          Contact
        </Link>
        <div className="m-actions">
          <a href={loginUrl} className="btn btn-ghost" onClick={closeMobile}>
            Sign in
          </a>
          <a href={appUrl} className="btn btn-primary" onClick={closeMobile}>
            Start free
          </a>
          <a
            href={getPublicAppPath("/analyze")}
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
