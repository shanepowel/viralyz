import Link from "next/link";
import { APP_NAME } from "@repo/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border-subtle)] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p className="text-display text-base font-semibold">{APP_NAME}</p>
          <p className="mt-1 text-sm text-[var(--text-tertiary)]">
            The creator operating system
          </p>
        </div>
        <nav className="flex flex-wrap gap-5 text-sm text-[var(--text-secondary)]">
          <Link href="/privacy" className="hover:text-[var(--text-primary)]">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[var(--text-primary)]">
            Terms
          </Link>
          <a href="mailto:hello@viralyz.com" className="hover:text-[var(--text-primary)]">
            Contact
          </a>
        </nav>
        <p className="text-sm text-[var(--text-tertiary)]">
          © {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>
    </footer>
  );
}
