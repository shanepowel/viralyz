"use client";

import Link from "next/link";
import { useState } from "react";
import { routes } from "@/lib/site";

/**
 * Public paste-a-link entry. Does not invent scores locally —
 * sends visitors to the product app to score for real.
 */
export function LinkScorer({ className }: { className?: string }) {
  const [url, setUrl] = useState("");

  const target = url.trim()
    ? `${routes.signup}?url=${encodeURIComponent(url.trim())}`
    : routes.signup;

  return (
    <div className={className}>
      <div className="scorer">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a TikTok, Reel or YouTube link"
          aria-label="Paste a link to score"
        />
        <Link className="btn btn-violet" href={target}>
          Score it free
        </Link>
      </div>
      <p style={{ marginTop: 10, fontSize: 13, color: "var(--ink-3)" }}>
        Opens Viralyz to score your link. Ten free scores a month. No card
        required.
      </p>
    </div>
  );
}
