import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <MarketingShell>
      <div className="mx-auto flex min-h-[60vh] max-w-container flex-col items-start justify-center px-6 py-20">
        <p className="tabular text-sm text-muted">404</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">
          That page doesn&apos;t pre-flight.
        </h1>
        <p className="mt-3 max-w-prose text-muted">
          The link is broken or the page has moved. Try one of these instead.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/" className={buttonClasses({ variant: "primary" })}>
            Back to home
          </Link>
          <Link
            href="/platform"
            className={buttonClasses({ variant: "secondary" })}
          >
            See the platform
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
