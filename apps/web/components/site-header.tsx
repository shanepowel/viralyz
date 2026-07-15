"use client";

import { useState } from "react";
import Link from "next/link";
import { APP_NAME } from "@repo/config";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, Menu, Sparkles, X } from "lucide-react";

type NavLink = { label: string; href: string };

const productLinks: NavLink[] = [
  { label: "Video scoring", href: "/#tools" },
  { label: "Hook tester", href: "/#tools" },
  { label: "Thumbnail tests", href: "/#tools" },
  { label: "Analytics", href: "/#tools" },
];

const creatorLinks: NavLink[] = [
  { label: "Get discovered", href: "/for-creators" },
  { label: "Media kit builder", href: "/for-creators" },
  { label: "Rate calculator", href: "/for-creators" },
];

const brandLinks: NavLink[] = [
  { label: "Browse creators", href: "/creators" },
  { label: "Why Viralyz", href: "/for-brands" },
];

function NavDropdown({ label, links }: { label: string; links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        aria-expanded={open}
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-3">
          <div className="rounded-xl border border-border bg-card p-2 shadow-xl shadow-black/40">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000";

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavDropdown label="Product" links={productLinks} />
          <NavDropdown label="For creators" links={creatorLinks} />
          <NavDropdown label="For brands" links={brandLinks} />
          <Link href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href={appUrl}>
            <Button size="sm">
              Open App
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {[
              { label: "Product", href: "/#tools" },
              { label: "For creators", href: "/for-creators" },
              { label: "For brands", href: "/for-brands" },
              { label: "Browse creators", href: "/creators" },
              { label: "Pricing", href: "/#pricing" },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                Sign in
              </Button>
            </Link>
            <Link href={appUrl}>
              <Button className="w-full">
                Open App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
