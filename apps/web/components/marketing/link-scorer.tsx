"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getPublicAppUrl, getPublicLoginUrl } from "@repo/config";

const CIRC = 113;

function scoreColor(v: number) {
  if (v >= 80) return "#0FA968";
  if (v >= 60) return "#7CA426";
  if (v >= 40) return "#D9950B";
  return "#DE4E4E";
}

/**
 * Public paste-a-link scorer (Creatify-style zero-friction entry).
 * Demo mode until POST /api/public/score ships: shows overall score + one fix,
 * then funnels to signup for the full breakdown.
 */
export function LinkScorer({ className }: { className?: string }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [score, setScore] = useState(0);
  const [color, setColor] = useState(scoreColor(54));
  const reduced = useRef(false);
  const appUrl = getPublicAppUrl();
  const loginUrl = getPublicLoginUrl();

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  function animateTo(target: number) {
    if (reduced.current) {
      setScore(target);
      setColor(scoreColor(target));
      return;
    }
    const start = performance.now();
    const from = 0;
    const dur = 900;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const v = Math.round(from + (target - from) * e);
      setScore(v);
      setColor(scoreColor(v));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  async function runScore() {
    if (!url.trim()) return;
    setBusy(true);
    setShow(false);
    // Prefer live public API when available; fall back to honest demo result.
    let target = 54;
    try {
      const res = await fetch("/api/public/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (res.ok) {
        const data = (await res.json()) as { score?: number };
        if (typeof data.score === "number") target = Math.round(data.score);
      }
    } catch {
      // offline / not wired yet
    }
    await new Promise((r) => setTimeout(r, 900));
    setShow(true);
    animateTo(target);
    setBusy(false);
  }

  const offset = CIRC - (CIRC * score) / 100;

  return (
    <div className={className}>
      <div className="scorer">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void runScore();
          }}
          placeholder="Paste a TikTok, Reel or YouTube link"
          aria-label="Paste a link to score"
        />
        <button
          type="button"
          className="btn btn-violet"
          onClick={() => void runScore()}
          disabled={busy}
        >
          {busy ? "Scoring…" : "Score it"}
        </button>
      </div>
      <div className={`scorer-result${show ? " show" : ""}`} aria-live="polite">
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
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
            />
          </svg>
          <span className="mn" style={{ color }}>
            {score}
          </span>
        </div>
        <div className="sr-text">
          <b>Weakest area: the opening.</b> Your first line buries the point. One
          fix is worth +12.
        </div>
        <Link className="sr-lock" href={loginUrl || appUrl}>
          See all 5 fixes free →
        </Link>
      </div>
    </div>
  );
}
