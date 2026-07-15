"use client";

import { useEffect, useState } from "react";

const C = 113;
const col = (v: number) =>
  v >= 80 ? "#0FA968" : v >= 60 ? "#7CA426" : v >= 40 ? "#D9950B" : "#DE4E4E";

const phases: [number, string][] = [
  [38, "checking the hook"],
  [52, "checking visuals"],
  [63, "checking pacing"],
  [81, "ready · 3 fixes applied"],
];

function MiniRing({
  value,
  color,
}: {
  value: number;
  color: string;
}) {
  const offset = C - (C * value) / 100;
  return (
    <div className="miniring">
      <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden>
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="#F1EFEA"
          strokeWidth="4"
        />
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="mn" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function LiveAnalyzingCard() {
  const [value, setValue] = useState(0);
  const [status, setStatus] = useState("checking the hook");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(81);
      setStatus("ready · 3 fixes applied");
      return;
    }

    let cancelled = false;
    const valueRef = { current: 0 };

    const animateTo = (target: number, dur: number) =>
      new Promise<void>((resolve) => {
        const start = valueRef.current;
        const t0 = performance.now();
        const tick = (t: number) => {
          if (cancelled) return;
          const p = Math.min((t - t0) / dur, 1);
          const e = 1 - Math.pow(1 - p, 3);
          const v = Math.round(start + (target - start) * e);
          valueRef.current = v;
          setValue(v);
          if (p < 1) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });

    const loop = async () => {
      while (!cancelled) {
        valueRef.current = 0;
        setValue(0);
        for (const [v, label] of phases) {
          if (cancelled) return;
          setStatus(label);
          await animateTo(v, 900);
          await new Promise((r) => setTimeout(r, 650));
        }
        await new Promise((r) => setTimeout(r, 3400));
      }
    };

    void loop();
    return () => {
      cancelled = true;
    };
  }, []);

  const color = col(value);

  return (
    <div
      className="ccard analyzing"
      style={{ top: 20, right: 8, transform: "rotate(1.8deg)" }}
    >
      <div
        className="face"
        style={{ background: "linear-gradient(135deg,#6C4CF1,#3D2A9E)" }}
      >
        <span className="ini">JT</span>
        <div className="scan" />
      </div>
      <div className="who">
        <div>
          <div className="name">Jordan T.</div>
          <div className="niche">Fitness · 88K</div>
        </div>
        <MiniRing value={value} color={color} />
      </div>
      <div className="status-line">{status}</div>
    </div>
  );
}

export function CreatorMosaic() {
  return (
    <div className="mosaic" aria-label="Creators on Viralyz">
      <div className="badge-float" style={{ top: 8, left: 34 }}>
        <span className="dot" />
        2,140 creators scored today
      </div>

      <div className="ccard" style={{ top: 56, left: 0, transform: "rotate(-2.5deg)" }}>
        <div
          className="face"
          style={{ background: "linear-gradient(135deg,#F2994A,#EB5757)" }}
        >
          <span className="ini">MR</span>
        </div>
        <div className="who">
          <div>
            <div className="name">Maya R.</div>
            <div className="niche">Food · 214K</div>
          </div>
          <MiniRing value={89} color="#0FA968" />
        </div>
        <div className="stat">
          <span>Average views</span>
          <b>412K</b>
        </div>
      </div>

      <LiveAnalyzingCard />

      <div
        className="ccard"
        style={{ top: 268, left: 56, transform: "rotate(1.2deg)" }}
      >
        <div
          className="face"
          style={{ background: "linear-gradient(135deg,#56CCF2,#2F80ED)" }}
        >
          <span className="ini">AD</span>
        </div>
        <div className="who">
          <div>
            <div className="name">Amara D.</div>
            <div className="niche">Beauty · 1.2M</div>
          </div>
          <MiniRing value={94} color="#0FA968" />
        </div>
        <div className="stat">
          <span>Predictions right</span>
          <b>91%</b>
        </div>
      </div>

      <div
        className="ccard"
        style={{ top: 300, right: 0, transform: "rotate(-1.6deg)" }}
      >
        <div
          className="face"
          style={{ background: "linear-gradient(135deg,#27AE60,#145A32)" }}
        >
          <span className="ini">SK</span>
        </div>
        <div className="who">
          <div>
            <div className="name">Sam K.</div>
            <div className="niche">Tech · 340K</div>
          </div>
          <MiniRing value={74} color="#7CA426" />
        </div>
        <div className="stat">
          <span>This month</span>
          <b className="tick-up">▲ +6</b>
        </div>
      </div>

      <div className="badge-float" style={{ bottom: 16, left: "20%" }}>
        ✦ Maya just booked a brand deal{" "}
        <span className="mono">· on Viralyz</span>
      </div>
    </div>
  );
}
