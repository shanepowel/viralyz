"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as Dialog from "@radix-ui/react-dialog";
import * as Accordion from "@radix-ui/react-accordion";
import { Menu, X } from "lucide-react";
import { APP_NAME } from "@repo/config";
import { chromeLinks, mainNav, type NavLink } from "@/config/nav";
import { buttonClasses } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/chrome/ThemeToggle";
import { useScrolled } from "@/hooks/use-scrolled";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";

function MegaLink({ link }: { link: NavLink }) {
  const Icon = link.icon;
  const inner = (
    <>
      {Icon ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-accent-soft text-accent">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      ) : null}
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{link.label}</span>
        {link.desc ? (
          <span className="mt-0.5 block text-sm text-ink-tertiary leading-snug">
            {link.desc}
          </span>
        ) : null}
      </span>
    </>
  );

  const className =
    "flex gap-3 rounded-sm p-2 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

  if (link.external) {
    return (
      <a
        href={link.href}
        className={className}
        onClick={() => track("nav_feature_click", { feature: link.label })}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link
      href={link.href}
      className={className}
      onClick={() => track("nav_feature_click", { feature: link.label })}
    >
      {inner}
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname() ?? "/";
  const scrolled = useScrolled(8);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-14 md:h-16 transition-colors duration-[var(--dur-fast)]",
        scrolled
          ? "border-b border-line bg-bg/80 backdrop-blur"
          : "border-b border-transparent bg-bg",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-sm focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-full max-w-container items-center gap-6 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-sm bg-accent"
            aria-hidden
          >
            <span className="h-2 w-2 rounded-[2px] bg-accent-foreground" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            {APP_NAME}
          </span>
        </Link>

        <NavigationMenu.Root className="relative hidden flex-1 md:flex">
          <NavigationMenu.List className="flex items-center gap-1">
            {mainNav.map((section) =>
              section.groups?.length ? (
                <NavigationMenu.Item key={section.label}>
                  <NavigationMenu.Trigger
                    className={cn(
                      "group relative inline-flex h-9 items-center gap-1 rounded-sm px-3 text-sm transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent data-[state=open]:text-ink",
                      isActive(pathname, section.href)
                        ? "text-ink after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:bg-accent"
                        : "text-ink-secondary",
                    )}
                  >
                    {section.label}
                    <span
                      className="text-[10px] opacity-60 transition-transform group-data-[state=open]:rotate-180"
                      aria-hidden
                    >
                      ▾
                    </span>
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content className="absolute left-0 top-full pt-2 data-[motion]:animate-in">
                    <div className="min-w-[28rem] rounded-lg border border-line bg-raised p-4 shadow-md">
                      <div
                        className={cn(
                          "grid gap-4",
                          section.groups.length > 1
                            ? "grid-cols-2"
                            : "grid-cols-1",
                        )}
                      >
                        {section.groups.map((group) => (
                          <div key={group.heading}>
                            <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-ink-tertiary">
                              {group.heading}
                            </p>
                            <div className="space-y-0.5">
                              {group.links.map((link) => (
                                <MegaLink key={link.label} link={link} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      {section.label === "Platform" ? (
                        <div className="mt-3 border-t border-line pt-3 px-2">
                          <Link
                            href="/platform/viral-score"
                            className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-ink"
                          >
                            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                              New
                            </span>
                            Live score while recording
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              ) : (
                <NavigationMenu.Item key={section.label}>
                  <NavigationMenu.Link asChild>
                    <Link
                      href={section.href}
                      className={cn(
                        "relative inline-flex h-9 items-center rounded-sm px-3 text-sm transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        isActive(pathname, section.href)
                          ? "text-ink after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:bg-accent"
                          : "text-ink-secondary",
                      )}
                    >
                      {section.label}
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
              ),
            )}
          </NavigationMenu.List>
          <NavigationMenu.Viewport />
        </NavigationMenu.Root>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <a
            href={chromeLinks.signIn}
            className={cn(
              buttonClasses({ variant: "ghost", size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            Sign in
          </a>
          <a
            href={chromeLinks.startFree}
            className={cn(
              buttonClasses({ variant: "primary", size: "sm" }),
              "hidden sm:inline-flex",
            )}
            onClick={() => track("cta_start_free", { location: "nav" })}
          >
            Start free
          </a>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

function MobileNav() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-ink md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-in" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-[min(100%,22rem)] flex-col bg-bg shadow-md focus:outline-none">
          <div className="flex h-14 items-center justify-between border-b border-line px-4">
            <Dialog.Title className="font-display text-lg font-semibold">
              Menu
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <Accordion.Root type="multiple" className="space-y-1">
              {mainNav.map((section) =>
                section.groups?.length ? (
                  <Accordion.Item
                    key={section.label}
                    value={section.label}
                    className="rounded-md"
                  >
                    <Accordion.Header>
                      <Accordion.Trigger className="flex w-full items-center justify-between rounded-sm px-3 py-3 text-left text-sm font-medium text-ink hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                        {section.label}
                        <span aria-hidden className="text-ink-tertiary">
                          ▾
                        </span>
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="px-1 pb-2">
                      <Dialog.Close asChild>
                        <Link
                          href={section.href}
                          className="block rounded-sm px-3 py-2.5 text-sm text-ink-secondary hover:bg-sunken hover:text-ink"
                        >
                          Overview
                        </Link>
                      </Dialog.Close>
                      {section.groups.flatMap((g) =>
                        g.links.map((link) => (
                          <Dialog.Close key={link.label} asChild>
                            <Link
                              href={link.href}
                              className="block rounded-sm px-3 py-2.5 text-sm text-ink-secondary hover:bg-sunken hover:text-ink"
                            >
                              {link.label}
                            </Link>
                          </Dialog.Close>
                        )),
                      )}
                    </Accordion.Content>
                  </Accordion.Item>
                ) : (
                  <Dialog.Close key={section.label} asChild>
                    <Link
                      href={section.href}
                      className="block rounded-sm px-3 py-3 text-sm font-medium text-ink hover:bg-sunken"
                    >
                      {section.label}
                    </Link>
                  </Dialog.Close>
                ),
              )}
            </Accordion.Root>
          </div>
          <div className="space-y-2 border-t border-line p-4">
            <a
              href={chromeLinks.signIn}
              className={cn(
                buttonClasses({ variant: "secondary", size: "md" }),
                "w-full",
              )}
            >
              Sign in
            </a>
            <a
              href={chromeLinks.startFree}
              className={cn(
                buttonClasses({ variant: "primary", size: "md" }),
                "w-full",
              )}
              onClick={() => track("cta_start_free", { location: "nav" })}
            >
              Start free
            </a>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
