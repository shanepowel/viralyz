"use client";

import { useActionState } from "react";
import Link from "next/link";
import { APP_NAME } from "@repo/config";
import { getFooterColumns } from "@/config/nav";
import { ThemeToggle } from "@/components/chrome/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { submitNewsletter, type FormState } from "@/app/actions/forms";
import { routes } from "@/lib/site";

const initial: FormState = { ok: false };

export function Footer() {
  const year = new Date().getFullYear();
  const columns = getFooterColumns();
  const [state, action, pending] = useActionState(submitNewsletter, initial);

  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto max-w-container px-4 py-14 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-sm bg-accent"
                aria-hidden
              >
                <span className="h-2 w-2 rounded-[2px] bg-accent-foreground" />
              </span>
              <span className="font-display text-lg font-semibold text-ink">
                {APP_NAME}
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-ink-secondary leading-relaxed">
              Score your content before you post it. Build a record brands can
              trust.
            </p>
            <form action={action} className="mt-5 flex gap-2">
              <label className="sr-only" htmlFor="footer-email">
                Email
              </label>
              <Input
                id="footer-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="max-w-[14rem]"
              />
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden
              />
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? "Sending…" : "Subscribe"}
              </Button>
            </form>
            {state.ok ? (
              <p className="mt-2 text-sm text-score-high">You are on the list.</p>
            ) : state.errors?.email ? (
              <p className="mt-2 text-sm text-score-low">{state.errors.email[0]}</p>
            ) : null}
          </div>
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">
                {col.heading}
              </h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="py-1 text-sm text-ink-secondary hover:text-ink transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 text-sm text-ink-tertiary md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {APP_NAME} · A Digiteq Holdings company · Windsor, UK
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href={routes.privacy} className="hover:text-ink py-1">
              Privacy
            </Link>
            <Link href={routes.terms} className="hover:text-ink py-1">
              Terms
            </Link>
            <Link href={routes.cookies} className="hover:text-ink py-1">
              Cookies
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
