import Link from "next/link";
import { APP_NAME } from "@repo/config";
import { Sparkles } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Video scoring", href: "/#tools" },
      { label: "Hook tester", href: "/#tools" },
      { label: "Thumbnail tests", href: "/#tools" },
      { label: "Analytics", href: "/#tools" },
    ],
  },
  {
    title: "Creators",
    links: [
      { label: "Get discovered", href: "/for-creators" },
      { label: "Media kit builder", href: "/for-creators" },
      { label: "Rate calculator", href: "/for-creators" },
    ],
  },
  {
    title: "Brands",
    links: [
      { label: "Browse creators", href: "/creators" },
      { label: "Why Viralyz", href: "/for-brands" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Pricing", href: "/#pricing" },
      { label: "Sign in", href: "/dashboard" },
    ],
  },
];

export function SiteFooter() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000";

  return (
    <footer className="border-t border-border px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold">{APP_NAME}</span>
            </Link>
            <p className="mt-3 max-w-[22ch] text-sm text-muted-foreground">
              Score your content before you post it.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <span>
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </span>
          <div className="flex gap-4">
            <a href={`${appUrl}/privacy`} className="hover:text-foreground">
              Privacy
            </a>
            <a href={`${appUrl}/terms`} className="hover:text-foreground">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
