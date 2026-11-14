"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Safe zones on a 1080 × 1920 canvas, from each platform's published ad
 * specs. Keep in step with the app (viralyzapp lib/preflight/placements).
 */
const ZONES = {
  story: { label: "Meta Stories and Reels", top: 250, bottom: 250, side: 54 },
  tiktok: { label: "TikTok", top: 150, bottom: 320, side: 64 },
} as const;

type ZoneId = keyof typeof ZONES;
type Overlay = "guides" | "ui";

const W = 1080;
const H = 1920;

/** Runs in the browser only. The image never leaves the device. */
export function SafeZoneChecker() {
  const [zone, setZone] = useState<ZoneId>("story");
  const [overlay, setOverlay] = useState<Overlay>("guides");
  const [src, setSrc] = useState<string | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
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
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setSize({ w: img.naturalWidth, h: img.naturalHeight });
      setSrc(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError("That image could not be read. Try exporting it again as PNG or JPG.");
    };
    img.src = url;
  }

  const z = ZONES[zone];
  const pct = {
    top: (z.top / H) * 100,
    bottom: (z.bottom / H) * 100,
    side: (z.side / W) * 100,
  };
  const ratio = size ? size.w / size.h : null;
  const isNineSixteen = ratio != null && Math.abs(ratio - 9 / 16) < 0.01;

  const seg = (on: boolean, first: boolean) =>
    cn(
      "min-h-11 cursor-pointer border-0 px-3.5 text-[14px] font-medium",
      !first && "border-l border-rule",
      on ? "bg-ink text-bg" : "bg-transparent text-ink hover:bg-panel",
    );

  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-8 border-t border-rule pt-6 lg:grid-cols-[minmax(0,340px)_1fr]">
      <div>
        <div
          className={cn(
            "relative mx-auto aspect-[9/16] w-full max-w-[340px] overflow-hidden border border-rule bg-card",
            !src && "hatch",
          )}
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="Your ad" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <span className="bg-card px-2 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-muted">
                Your 9:16 ad goes here
              </span>
            </div>
          )}
          {overlay === "ui" ? (
            <>
              <div aria-hidden="true" className="absolute inset-x-0 top-0 flex items-center gap-2 bg-black/40 px-3" style={{ height: `${pct.top}%` }}>
                <span className="h-6 w-6 rounded-full bg-white/90" />
                <span className="h-2 w-24 bg-white/90" />
              </div>
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-black/40 px-3" style={{ height: `${pct.bottom}%` }}>
                <span className="h-8 flex-1 rounded-full border border-white/90" />
                <span className="h-6 w-6 rounded-full border border-white/90" />
              </div>
            </>
          ) : (
            <div
              aria-hidden="true"
              className="absolute border border-dashed border-guide"
              style={{ top: `${pct.top}%`, bottom: `${pct.bottom}%`, left: `${pct.side}%`, right: `${pct.side}%` }}
            >
              <span className="absolute left-0 top-0 bg-guide px-1 font-mono text-[10px] uppercase tracking-[0.06em] text-white">
                Safe zone
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <p className="kicker m-0 text-ink">1 Your image</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
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

        <p className="kicker m-0 mt-7 text-ink">2 Where it runs</p>
        <div role="radiogroup" aria-label="Placement" className="mt-2 inline-flex flex-wrap border border-rule">
          {(Object.keys(ZONES) as ZoneId[]).map((id, i) => (
            <button key={id} type="button" role="radio" aria-checked={zone === id} onClick={() => setZone(id)} className={seg(zone === id, i === 0)}>
              {ZONES[id].label}
            </button>
          ))}
        </div>

        <p className="kicker m-0 mt-7 text-ink">3 What to show</p>
        <div role="radiogroup" aria-label="Overlay" className="mt-2 inline-flex flex-wrap border border-rule">
          <button type="button" role="radio" aria-checked={overlay === "guides"} onClick={() => setOverlay("guides")} className={seg(overlay === "guides", true)}>
            Safe-zone guide
          </button>
          <button type="button" role="radio" aria-checked={overlay === "ui"} onClick={() => setOverlay("ui")} className={seg(overlay === "ui", false)}>
            The app&apos;s own controls
          </button>
        </div>

        <dl className="m-0 mt-7 border-t border-rule">
          {(
            [
              ["Keep clear at the top", `${z.top} px`],
              ["Keep clear at the bottom", `${z.bottom} px`],
              ["Keep clear at each side", `${z.side} px`],
              ["Canvas", `${W} × ${H} px`],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line py-2">
              <dt className="text-[15px]">{k}</dt>
              <dd className="m-0 font-mono text-[13px]">{v}</dd>
            </div>
          ))}
        </dl>

        {size ? (
          <p className={cn("m-0 mt-4 text-[15px]", isNineSixteen ? "text-ink-2" : "margin-note")} aria-live="polite">
            Your image is <span className="font-mono text-[13px]">{size.w} × {size.h} px</span>.{" "}
            {isNineSixteen
              ? "That is 9:16, so the guide lines up with what people will see."
              : "That is not 9:16, so it is cropped to fill the frame here. Export at 1080 × 1920 px for this placement."}
          </p>
        ) : null}
        <p className="m-0 mt-4 text-[14px] text-muted">
          Anything outside the blue guide can sit under the profile row, the caption or the reply bar. Keep your headline,
          price, logo and button inside it.
        </p>
      </div>
    </div>
  );
}
