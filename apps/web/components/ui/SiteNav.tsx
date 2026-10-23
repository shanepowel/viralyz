"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { chromeLinks, mainNav } from "@/config/nav";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Sticky white bar: logo, five links, "Log in" and "Get started". Wraps on mobile. */
export function SiteNav() {
  const pathname = usePathname() ?? "/";

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-inner focus:bg-btn focus:px-3 focus:py-2 focus:text-sm focus:text-btn-ink"
      >
        Skip to content
      </a>
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-x-3 gap-y-1 px-[clamp(16px,4vw,40px)] py-3"
      >
        <Logo />
        <ul className="order-3 m-0 flex w-full list-none flex-wrap gap-x-7 gap-y-0.5 p-0 text-[15px] md:order-none md:w-auto">
          {mainNav.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center hover:text-muted",
                    active && "font-semibold",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-2">
          <a
            href={chromeLinks.signIn}
            className="inline-flex min-h-11 items-center px-3 text-[15px] hover:text-muted"
          >
            Log in
          </a>
          <ButtonLink
            href={chromeLinks.startFree}
            size="sm"
            onClick={() => track("cta_start_free", { location: "nav" })}
          >
            Get started
          </ButtonLink>
        </div>
      </nav>
    </header>
  );
}
