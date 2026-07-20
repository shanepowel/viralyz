"use client";

import { useState } from "react";

const SIZES = [
  { label: "YouTube sidebar", w: 168, h: 94 },
  { label: "YouTube home", w: 320, h: 180 },
  { label: "TikTok grid", w: 120, h: 213 },
] as const;

export function ThumbnailChecker() {
  const [src, setSrc] = useState<string | null>(null);

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        aria-label="Upload a thumbnail image"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (src) URL.revokeObjectURL(src);
          if (f) setSrc(URL.createObjectURL(f));
          else setSrc(null);
        }}
      />
      {src ? (
        <div
          className="mt-6 flex flex-wrap items-end gap-8"
          style={{
            marginTop: 24,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            gap: 32,
          }}
        >
          {SIZES.map((s) => (
            <figure key={s.label}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                width={s.w}
                height={s.h}
                style={{
                  width: s.w,
                  height: s.h,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid var(--line)",
                }}
              />
              <figcaption
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: "var(--ink-3)",
                }}
              >
                {s.label} · {s.w}×{s.h}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}
      <p style={{ marginTop: 16, fontSize: 14, color: "var(--ink-2)" }}>
        If you cannot read it at these sizes, neither can anyone else.
      </p>
    </div>
  );
}
