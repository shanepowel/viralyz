"use client";

import { useState } from "react";
import { RoveAd } from "@/components/studio/ExampleAds";
import { cn } from "@/lib/cn";

type View = "feed" | "artboard";

const CHECKS = [
  { rule: "1", name: "Contrast", reading: "6.0:1" },
  { rule: "3", name: "Aspect ratio", reading: "9:16" },
  { rule: "4", name: "Characters", reading: "18 of 40" },
  { rule: "5", name: "Policy", reading: "no claims" },
] as const;

function Tick() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true" className="text-pass">
      <path d="M2 7.5l3.2 3.2L12 3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
    </svg>
  );
}

/**
 * The homepage demo, and the product in one picture: a story ad whose button
 * sits under the platform's own controls. The problem is marked on the proof
 * with a note; the fix moves the button and the mark clears. Fictional brand.
 */
export function ProofDemo({ className }: { className?: string }) {
  const [view, setView] = useState<View>("artboard");
  const [fixed, setFixed] = useState(false);
  const guides = view === "artboard";

  return (
    <figure className={cn("m-0 border border-rule bg-card", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule px-4 py-2.5">
        <p className="kicker m-0 text-ink">
          Rove Coffee <span className="text-muted">/ Story 9:16 / 1080 × 1920 px</span>
        </p>
        <div role="radiogroup" aria-label="How to view the ad" className="inline-flex border border-rule">
          {(
            [
              ["feed", "As people see it"],
              ["artboard", "Artboard"],
            ] as const
          ).map(([value, label], i) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={view === value}
              onClick={() => setView(value)}
              className={cn(
                "min-h-8 cursor-pointer border-0 px-2.5 text-[12px] font-medium",
                i > 0 && "border-l border-rule",
                view === value ? "bg-ink text-bg" : "bg-transparent text-ink hover:bg-panel",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-[minmax(0,220px)_1fr] sm:p-6">
        <div className="relative mx-auto aspect-[9/16] w-full max-w-[220px] overflow-hidden border border-rule">
          <div className="absolute inset-0">
            <RoveAd size="md" />
          </div>
          {/* What the platform draws on top of every story. */}
          {view === "feed" ? (
            <>
              <div aria-hidden="true" className="absolute inset-x-0 top-0 flex h-[13%] items-center gap-2 bg-black/35 px-3">
                <span className="h-5 w-5 rounded-full bg-white/90" />
                <span className="h-1.5 w-16 bg-white/90" />
              </div>
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 flex h-[17%] items-center gap-2 bg-black/35 px-3">
                <span className="h-7 flex-1 rounded-full border border-white/90" />
                <span className="h-5 w-5 rounded-full border border-white/90" />
              </div>
            </>
          ) : null}
          {guides ? (
            <div aria-hidden="true" className="absolute inset-x-[5%] bottom-[17%] top-[13%] border border-dashed border-guide">
              <span className="absolute left-0 top-0 bg-guide px-1 font-mono text-[9px] uppercase tracking-[0.06em] text-white">
                Safe zone
              </span>
            </div>
          ) : null}
          <span
            className={cn(
              "absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FFF4EC] px-3.5 py-1.5 text-[11px] font-semibold text-[#3A1608] transition-[bottom] duration-[var(--vz-dur-med)] ease-out",
              fixed ? "bottom-[21%]" : "bottom-[7%]",
              !fixed && guides && "outline outline-2 outline-offset-2 outline-mark",
            )}
          >
            Subscribe &amp; save
          </span>
          {!fixed && guides ? (
            <span
              aria-hidden="true"
              className="absolute bottom-[5.5%] right-[9%] inline-flex h-[20px] w-[20px] items-center justify-center rounded-full border border-mark bg-card font-mono text-[11px] font-medium text-mark"
            >
              1
            </span>
          ) : null}
        </div>

        <div className="min-w-0" aria-live="polite">
          {fixed ? (
            <>
              <p className="m-0 font-display text-[26px] text-pass">Cleared.</p>
              <p className="m-0 mt-1.5 text-[14px] text-ink-2">
                The button moved up 64 px, inside the safe zone. Nothing else changed.
              </p>
            </>
          ) : (
            <>
              <p className="m-0 font-display text-[26px] text-mark">1 mark to clear.</p>
              <div className="mt-3 grid grid-cols-[26px_1fr] gap-2 border-y border-mark py-3">
                <span
                  aria-hidden="true"
                  className="inline-flex h-[20px] w-[20px] items-center justify-center rounded-full border border-mark font-mono text-[11px] font-medium text-mark"
                >
                  1
                </span>
                <div>
                  <p className="kicker m-0">Rule 2 / Safe zone</p>
                  <p className="margin-note m-0 mt-1">
                    The button sits under the reply bar. On a phone, nobody can see it or tap it.
                  </p>
                </div>
              </div>
            </>
          )}

          <ul className="m-0 mt-4 list-none border-t border-rule p-0">
            {fixed ? (
              <li className="flex items-center justify-between gap-3 border-b border-line py-2 text-[14px]">
                <span className="flex items-center gap-2">
                  <Tick /> Safe zone
                </span>
                <span className="font-mono text-[12px] text-muted">inside</span>
              </li>
            ) : null}
            {CHECKS.map((c) => (
              <li key={c.name} className="flex items-center justify-between gap-3 border-b border-line py-2 text-[14px]">
                <span className="flex items-center gap-2">
                  <Tick /> {c.name}
                </span>
                <span className="font-mono text-[12px] text-muted">{c.reading}</span>
              </li>
            ))}
            <li className="flex items-center justify-between gap-3 border-b border-line py-2 text-[14px] text-muted">
              <span>Hook strength</span>
              <span className="font-mono text-[12px]">~71 estimate</span>
            </li>
          </ul>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {fixed ? (
              <button
                type="button"
                onClick={() => setFixed(false)}
                className="min-h-11 cursor-pointer border-0 bg-transparent p-0 text-[14px] font-semibold text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
              >
                Undo
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setFixed(true)}
                className="min-h-11 cursor-pointer rounded-inner border border-mark bg-mark px-4 text-[14px] font-semibold text-white hover:opacity-85"
              >
                Move it up 64 px
              </button>
            )}
          </div>
        </div>
      </div>
      <figcaption className="border-t border-line px-4 py-2 font-mono text-[11px] text-muted">
        A working example with a fictional brand. Try the fix.
      </figcaption>
    </figure>
  );
}
