"use client";

import { useEffect, useRef, useState } from "react";

const color = (v: number) =>
  v >= 75
    ? "var(--score-high)"
    : v >= 50
      ? "var(--score-mid)"
      : "var(--score-low)";

export function ScoreRing({
  value,
  size = 96,
  animate = true,
  label,
}: {
  value: number;
  size?: number;
  animate?: boolean;
  label?: string;
}) {
  const [display, setDisplay] = useState(animate ? 0 : value);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!animate) {
      setDisplay(value);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(value);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min((t - t0) / 900, 1);
          setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, animate]);

  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label ?? `Viral Score ${value} out of 100`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--line)"
        strokeWidth="6"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color(value)}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - display / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 120ms linear" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="var(--ink)"
        fontFamily="var(--font-mono)"
        fontSize={size * 0.3}
        fontWeight={600}
      >
        {display}
      </text>
    </svg>
  );
}
