"use client";

import { useActionState } from "react";
import Link from "next/link";
import { APP_NAME } from "@repo/config";
import { footerColumns } from "@/config/nav";
import { submitNewsletter, type FormState } from "@/app/actions/forms";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { COMPANY } from "@/lib/site";

const initial: FormState = { ok: false };

export function SiteFooter() {
  const year = new Date().getFullYear();
  const [state, action, pending] = useActionState(submitNewsletter, initial);

  return (
    <footer className="mx-auto flex max-w-site flex-col gap-10 px-[clamp(16px,4vw,40px)] pb-10 pt-14">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-8 text-[15px]">
        <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
          <Logo className="self-start" />
          <p className="m-0 text-muted">Make it. Check it. Then spend.</p>
          <form action={action} className="mt-3 flex flex-wrap gap-2">
            <label className="sr-only" htmlFor="footer-email">
              Email
            </label>
            <Input
              id="footer-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="min-w-0 flex-1 basis-40"
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
          <p className="m-0 min-h-5 text-sm text-muted" aria-live="polite">
            {state.ok
              ? "You are on the list."
              : state.errors?.email
                ? state.errors.email[0]
                : null}
          </p>
        </div>
        {footerColumns.map((col) => (
          <nav
            key={col.heading}
            aria-label={col.heading}
            className="flex flex-col gap-0.5"
          >
            <h2 className="m-0 mb-1 text-[15px] font-semibold">
              {col.heading}
            </h2>
            {col.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-8 items-center text-muted hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-[13px] text-muted">
        <span>
          © {year} {APP_NAME} · {COMPANY.legalName}, {COMPANY.location}
        </span>
        <span>Not affiliated with Meta or TikTok</span>
        <ThemeToggle />
      </div>
    </footer>
  );
}
