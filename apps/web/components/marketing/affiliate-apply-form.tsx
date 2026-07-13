"use client";

import { useState } from "react";
import { getPublicAppUrl } from "@repo/config";

export function AffiliateApplyForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [channel, setChannel] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const appUrl = getPublicAppUrl();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/affiliates/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, channel }),
      });
      const data = (await res.json()) as { code?: string; error?: string };
      if (!res.ok || !data.code) {
        setError(data.error || "Could not apply. Try again.");
        return;
      }
      setCode(data.code);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (code) {
    const link = `${typeof window !== "undefined" ? window.location.origin : "https://viralyz.com"}/?ref=${code}`;
    return (
      <div className="aff-done">
        <h3>You are in.</h3>
        <p>
          Your code is <span className="mono">{code}</span>. Share this link:
        </p>
        <p className="aff-link mono">{link}</p>
        <p className="fine">
          You earn 30% of paid plan revenue for 12 months on every signup that
          converts. Payouts open once Stripe Connect is live.{" "}
          <a href={appUrl} style={{ color: "var(--violet-deep)" }}>
            Open the app
          </a>{" "}
          to keep scoring.
        </p>
      </div>
    );
  }

  return (
    <form className="aff-form" onSubmit={(e) => void submit(e)}>
      <label>
        Your name
        <input
          className="c-input"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label>
        Email
        <input
          className="c-input"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        Where will you share? (BioPage, YouTube, newsletter…)
        <input
          className="c-input"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          placeholder="Optional"
        />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="btn btn-violet" disabled={busy}>
        {busy ? "Applying…" : "Join the programme"}
      </button>
    </form>
  );
}
