import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <MarketingShell>
      <div className="mx-auto flex min-h-[60vh] max-w-container flex-col items-start justify-center px-6 py-20">
        <p className="font-mono text-sm text-ink-tertiary">404</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">
          That page doesn&apos;t score.
        </h1>
        <p className="mt-3 max-w-prose text-ink-secondary">
          The link is broken or the page has moved. Try one of these instead.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/" className={buttonClasses({ variant: "primary" })}>
            Back to home
          </Link>
          <Link
            href="/creators"
            className={buttonClasses({ variant: "secondary" })}
          >
            Browse creators
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
