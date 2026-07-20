"use client";

import { useState } from "react";

const REPORT_SLUG = "viral-score-report-2026";

export function ReportGateForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/report/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reportSlug: REPORT_SLUG }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not save your email.");
        return;
      }
      setUnlocked(true);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (unlocked) {
    return (
      <div className="report-unlocked">
        <h3>You are on the list.</h3>
        <p>
          The full Viral Score Report PDF ships to your inbox when the first
          data cut is ready. Below is the public preview of what it covers.
        </p>
        <ul className="report-bullets">
          <li>Average scores by niche and platform</li>
          <li>Which fixes moved results most</li>
          <li>Hook styles that win by platform</li>
          <li>Real posting-time effects from tracked posts</li>
        </ul>
      </div>
    );
  }

  return (
    <form className="report-gate" onSubmit={(e) => void submit(e)}>
      <label>
        Work email
        <input
          className="c-input"
          type="email"
          required
          placeholder="you@brand.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="btn btn-violet" disabled={busy}>
        {busy ? "Saving…" : "Get the report"}
      </button>
      <p className="fine">No spam. One email when the PDF is ready, then rare updates.</p>
    </form>
  );
}
