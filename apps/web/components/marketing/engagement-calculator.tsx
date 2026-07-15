"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getPublicAppUrl } from "@repo/config";

export function EngagementCalculator() {
  const [followers, setFollowers] = useState("");
  const [likes, setLikes] = useState("");
  const [comments, setComments] = useState("");
  const appUrl = getPublicAppUrl();

  const result = useMemo(() => {
    const f = Number(followers);
    const l = Number(likes) || 0;
    const c = Number(comments) || 0;
    if (!f || f < 1) {
      return { pct: "0.0%", label: "Enter your numbers above", color: "var(--ink)" };
    }
    const r = ((l + c) / f) * 100;
    const color =
      r >= 6
        ? "var(--s90)"
        : r >= 3
          ? "var(--s70)"
          : r >= 1
            ? "var(--s50)"
            : "var(--s30)";
    const label =
      r >= 6
        ? "Excellent. Well above average."
        : r >= 3
          ? "Good. Above the typical 1 to 3%."
          : r >= 1
            ? "Typical. Most accounts sit here."
            : "Below average. Worth investigating.";
    return { pct: `${r.toFixed(1)}%`, label, color };
  }, [followers, likes, comments]);

  return (
    <div className="calc">
      <label htmlFor="cFollowers">Followers</label>
      <input
        id="cFollowers"
        type="number"
        min={1}
        placeholder="e.g. 50000"
        value={followers}
        onChange={(e) => setFollowers(e.target.value)}
      />
      <label htmlFor="cLikes">Average likes per post</label>
      <input
        id="cLikes"
        type="number"
        min={0}
        placeholder="e.g. 2500"
        value={likes}
        onChange={(e) => setLikes(e.target.value)}
      />
      <label htmlFor="cComments">Average comments per post</label>
      <input
        id="cComments"
        type="number"
        min={0}
        placeholder="e.g. 180"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
      />
      <div className="calc-out">
        <div>
          <div className="co-num" style={{ color: result.color }}>
            {result.pct}
          </div>
          <div className="co-lab">{result.label}</div>
        </div>
        <Link className="btn btn-violet" href={appUrl}>
          Score my content next
        </Link>
      </div>
    </div>
  );
}
