import { Check, Minus, X } from "lucide-react";
import { cn } from "@/lib/cn";

type CheckRow = { label: string; state: "pass" | "fail" | "na"; note: string };

// Illustrative values only. The card is labelled "Example" wherever it
// renders; nothing here is a measurement of a real ad.
const CHECKS: CheckRow[] = [
  { label: "Text contrast", state: "pass", note: "7.9:1" },
  { label: "Text-to-image area", state: "pass", note: "14%" },
  { label: "Safe-zone overlap", state: "pass", note: "None" },
  { label: "Aspect ratio", state: "pass", note: "4:5" },
  { label: "Character limits", state: "fail", note: "Primary 138/125" },
  { label: "Health claim", state: "pass", note: "None found" },
];

function StateIcon({ state }: { state: CheckRow["state"] }) {
  if (state === "pass")
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-score-high-soft text-score-high">
        <Check className="h-3 w-3" aria-hidden />
        <span className="sr-only">Passed</span>
      </span>
    );
  if (state === "fail")
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-score-low-soft text-score-low">
        <X className="h-3 w-3" aria-hidden />
        <span className="sr-only">Failed</span>
      </span>
    );
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sunken text-ink-tertiary">
      <Minus className="h-3 w-3" aria-hidden />
      <span className="sr-only">Not scored</span>
    </span>
  );
}

/** A Studio variant with its pre-flight checks, drawn in code for the marketing site. */
export function VariantMock({ className }: { className?: string }) {
  return (
    <figure
      className={cn(
        "relative rounded-lg border border-line bg-raised p-4 shadow-md md:p-5",
        className,
      )}
      aria-label="Example of a Studio variant with its pre-flight checks"
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
          Example
        </span>
        <span className="font-mono text-xs text-ink-tertiary">
          vz_k3p9 · Meta feed 4:5
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* The ad itself: product on a brand-colour field, headline set as real text. */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-[linear-gradient(160deg,#f6d9c4_0%,#e9a77f_55%,#c4643d_100%)]">
          <div className="absolute left-1/2 top-[30%] h-[42%] w-[34%] -translate-x-1/2 rounded-[40%_40%_18%_18%] bg-[linear-gradient(180deg,#fff7f0,#f1dccb)] shadow-[0_18px_30px_-12px_rgb(80_30_10/0.45)]" />
          <div className="absolute left-1/2 top-[26%] h-[7%] w-[20%] -translate-x-1/2 rounded-sm bg-[#3b2a22]" />
          <div className="absolute inset-x-3 bottom-3 rounded-sm bg-[#1b1826]/85 px-3 py-2.5 text-white">
            <p className="font-display text-[15px] font-semibold leading-tight">
              Two for £30 this week
            </p>
            <p className="mt-0.5 text-[11px] text-white/75">
              Shop the bundle →
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">
              Pre-flight
            </p>
            <p className="text-xs text-ink-tertiary">Angle: offer</p>
          </div>
          <div className="mt-2 flex items-end gap-2">
            <span className="font-mono text-4xl font-semibold tracking-tight text-ink">
              83
            </span>
            <span className="pb-1 text-xs leading-snug text-ink-tertiary">
              5 of 6 checks passed
            </span>
          </div>
          <ul className="mt-3 space-y-1.5">
            {CHECKS.map((c) => (
              <li
                key={c.label}
                className="flex items-center gap-2 text-[13px] text-ink-secondary"
              >
                <StateIcon state={c.state} />
                <span className="min-w-0 flex-1 truncate">{c.label}</span>
                <span
                  className={cn(
                    "font-mono text-[11px]",
                    c.state === "fail" ? "text-score-low" : "text-ink-tertiary",
                  )}
                >
                  {c.note}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 rounded-sm border border-dashed border-line-strong px-2.5 py-2 text-[12px] leading-snug text-ink-tertiary">
            <span className="font-medium text-ink-secondary">
              Hook clarity (AI-assessed):
            </span>{" "}
            offer is clear in the first line. Shown separately, not scored.
          </div>
        </div>
      </div>
    </figure>
  );
}
