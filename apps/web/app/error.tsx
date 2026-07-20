"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-container flex-col items-start justify-center px-6 py-20">
      <p className="font-mono text-sm text-ink-tertiary">500</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">
        Something went wrong on our side.
      </h1>
      <p className="mt-3 max-w-prose text-ink-secondary">
        Reload the page — if it keeps happening, tell us at hello@viralyz.com.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className={buttonClasses({ variant: "primary" })}
        >
          Try again
        </button>
        <Link
          href="/contact"
          className={buttonClasses({ variant: "secondary" })}
        >
          Contact us
        </Link>
      </div>
    </div>
  );
}
