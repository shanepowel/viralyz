"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const HEX = /^#[0-9a-f]{6}$/i;

function luminance(hex: string): number {
  const n = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = n.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** WCAG contrast ratio between two #rrggbb colours. */
export function contrastRatio(a: string, b: string): number | null {
  if (!HEX.test(a) || !HEX.test(b)) return null;
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

const SIZES = [
  { id: "feed", label: "Phone feed", width: 300 },
  { id: "small", label: "Small phone", width: 240 },
  { id: "grid", label: "Grid thumbnail", width: 120 },
] as const;

function ColourField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const valid = HEX.test(value);
  return (
    <label className="flex flex-col gap-1.5">
      <span className="kicker">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="color"
          value={valid ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} picker`}
          className="h-11 w-11 cursor-pointer border border-rule p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.trim())}
          aria-invalid={!valid}
          spellCheck={false}
          className={cn(
            "min-h-11 w-[130px] rounded-inner border border-rule bg-card px-3 font-mono text-[14px] uppercase",
            !valid && "text-mark",
          )}
        />
      </span>
    </label>
  );
}

/** Runs in the browser only. The image never leaves the device. */
export function ReadabilityChecker() {
  const [text, setText] = useState("#2A0E04");
  const [bg, setBg] = useState("#F26B3A");
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src);
    };
  }, [src]);

  function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file is not an image. Use a PNG, JPG or WebP.");
      return;
    }
    setError(null);
    setSrc(URL.createObjectURL(file));
  }

  const ratio = contrastRatio(text, bg);
  const passes = ratio != null && ratio >= 4.5;
  const passesLarge = ratio != null && ratio >= 3;

  return (
    <div className="flex flex-col gap-14">
      <section aria-label="Contrast" className="grid grid-cols-1 gap-x-8 gap-y-4 border-t border-rule pt-4 md:grid-cols-[200px_1fr]">
        <p className="kicker m-0 pt-1 text-ink">1 Contrast</p>
        <div className="min-w-0">
          <p className="m-0 max-w-[620px] text-ink-2">
            Enter the colour of your text and the colour behind it. Ads are read on phones, outdoors, at arm&apos;s length:
            below 4.5:1, small text starts to disappear.
          </p>
          <div className="mt-5 flex flex-wrap items-end gap-6">
            <ColourField label="Text colour" value={text} onChange={setText} />
            <ColourField label="Colour behind it" value={bg} onChange={setBg} />
          </div>
          <div className="mt-6 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-[minmax(0,280px)_1fr]">
            <div
              className="flex min-h-[150px] flex-col justify-between border border-rule p-4"
              style={{ background: HEX.test(bg) ? bg : undefined, color: HEX.test(text) ? text : undefined }}
            >
              <span className="font-display text-[28px]">Softer mornings start here</span>
              <span className="text-[13px]">Free UK delivery over £30</span>
            </div>
            <div aria-live="polite">
              {ratio == null ? (
                <p className="margin-note m-0">Enter both colours as six-digit hex, like #1E3A2A.</p>
              ) : (
                <>
                  <p className={cn("m-0 font-mono text-[56px] font-medium leading-none", passes ? "text-pass" : "text-mark")}>
                    {ratio.toFixed(1)}:1
                  </p>
                  <p className="m-0 mt-3 text-[15px]">
                    {passes
                      ? "Cleared. Body text and headlines are both readable."
                      : passesLarge
                        ? "Large headlines only. Body text and small print need 4.5:1."
                        : "Too low for any text. Darken one colour or lighten the other."}
                  </p>
                  <dl className="m-0 mt-4 border-t border-rule">
                    <div className="flex justify-between border-b border-line py-2 text-[14px]">
                      <dt>Body text, needs 4.5:1</dt>
                      <dd className={cn("m-0 font-mono text-[12px] uppercase", passes ? "text-pass" : "text-mark")}>{passes ? "Cleared" : "To fix"}</dd>
                    </div>
                    <div className="flex justify-between border-b border-line py-2 text-[14px]">
                      <dt>Large headline, needs 3:1</dt>
                      <dd className={cn("m-0 font-mono text-[12px] uppercase", passesLarge ? "text-pass" : "text-mark")}>{passesLarge ? "Cleared" : "To fix"}</dd>
                    </div>
                  </dl>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Feed size preview" className="grid grid-cols-1 gap-x-8 gap-y-4 border-t border-rule pt-4 md:grid-cols-[200px_1fr]">
        <p className="kicker m-0 pt-1 text-ink">2 At feed size</p>
        <div className="min-w-0">
          <p className="m-0 max-w-[620px] text-ink-2">
            You design at full size. People see the ad at about 300 px wide. If you cannot read it here, they cannot either.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="min-h-11 cursor-pointer rounded-inner border border-btn bg-btn px-4 text-[15px] font-semibold text-btn-ink hover:opacity-85"
            >
              {src ? "Choose another image" : "Choose an image"}
            </button>
            <span className="text-[14px] text-ink-2">It stays in your browser. Nothing is uploaded.</span>
          </div>
          <input
            ref={input}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            aria-label="Choose an image"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          {error ? (
            <p role="alert" className="margin-note m-0 mt-2">
              {error}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap items-end gap-6">
            {SIZES.map((s) => (
              <figure key={s.id} className="m-0">
                <div className={cn("overflow-hidden border border-rule bg-card", !src && "hatch aspect-[4/5]")} style={{ width: s.width }}>
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={`Your ad at ${s.width} pixels wide`} className="block h-auto w-full" />
                  ) : null}
                </div>
                <figcaption className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-muted">
                  {s.label} / {s.width} px
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
