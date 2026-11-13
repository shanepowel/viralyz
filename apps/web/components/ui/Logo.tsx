import Link from "next/link";
import { cn } from "@/lib/cn";

/** A proof box with the green tick that means "cleared", and the wordmark at 800. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex min-h-11 items-center gap-2 text-ink hover:text-ink",
        className,
      )}
    >
      <span
        className="inline-flex h-[20px] w-[20px] items-center justify-center border-[1.5px] border-ink"
        aria-hidden="true"
      >
        <svg width="12" height="12" viewBox="0 0 14 14">
          <path d="M2 7.5l3.2 3.2L12 3.5" fill="none" stroke="var(--vz-pass)" strokeWidth="2.4" strokeLinecap="square" />
        </svg>
      </span>
      <span className="font-display text-[20px]">viralyz</span>
    </Link>
  );
}
