import Link from "next/link";
import { Button } from "@repo/ui/button";
import { APP_NAME, getPublicAppUrl, getPublicLoginUrl } from "@repo/config";

const APP_URL = getPublicAppUrl();
const LOGIN_URL = getPublicLoginUrl();

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-base)_80%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-[var(--r-sm)] bg-[var(--accent)] text-sm font-semibold text-white"
            aria-hidden
          >
            V
          </span>
          <span className="text-display text-lg font-semibold tracking-tight">
            {APP_NAME}
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          <a
            href="#spine"
            className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            Score
          </a>
          <a
            href="#tools"
            className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            Tools
          </a>
          <a
            href="#pricing"
            className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={LOGIN_URL}>Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={APP_URL}>Open app</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
