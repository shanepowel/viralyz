"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Consent = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  ts: number;
};

const KEY = "viralyz-consent";

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

function writeConsent(v: Consent) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    // preview / private mode: banner may reappear, which is safe
  }
}

function loadConsented(_c: Consent) {
  // Inject analytics / marketing tags only after matching consent.
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (existing) {
      loadConsented(existing);
      return;
    }
    const t = window.setTimeout(() => setVisible(true), 900);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const open = () => {
      const c = readConsent();
      if (c) {
        setAnalytics(!!c.analytics);
        setMarketing(!!c.marketing);
      }
      setDetail(true);
      setVisible(true);
    };
    window.addEventListener("viralyz:open-cookies", open);
    return () => window.removeEventListener("viralyz:open-cookies", open);
  }, []);

  function save(mode: "all" | "essential" | "custom") {
    const c: Consent =
      mode === "all"
        ? { essential: true, analytics: true, marketing: true, ts: Date.now() }
        : mode === "essential"
          ? {
              essential: true,
              analytics: false,
              marketing: false,
              ts: Date.now(),
            }
          : {
              essential: true,
              analytics,
              marketing,
              ts: Date.now(),
            };
    writeConsent(c);
    loadConsented(c);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie choices">
      <h4>Cookies, the honest version.</h4>
      <p>
        We use essential cookies to make the site work. With your permission we
        also use analytics to see which pages help people, and marketing cookies
        to measure our ads.{" "}
        <Link href="/cookies">Read the full policy</Link>.
      </p>
      {detail && (
        <div className="cookie-detail">
          <div className="cookie-row">
            <div>
              <div className="cr-name">Essential</div>
              <div className="cr-desc">
                Sign in, security, remembering this choice. Always on.
              </div>
            </div>
            <label className="cswitch">
              <input type="checkbox" checked disabled readOnly />
              <span className="slider" />
            </label>
          </div>
          <div className="cookie-row">
            <div>
              <div className="cr-name">Analytics</div>
              <div className="cr-desc">
                Helps us improve pages. No personal profiles.
              </div>
            </div>
            <label className="cswitch">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>
          <div className="cookie-row">
            <div>
              <div className="cr-name">Marketing</div>
              <div className="cr-desc">
                Measures whether our ads work. Off unless you say yes.
              </div>
            </div>
            <label className="cswitch">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>
        </div>
      )}
      <div className="cookie-actions">
        <button type="button" className="btn btn-violet" onClick={() => save("all")}>
          Accept all
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => save("essential")}
        >
          Essential only
        </button>
        {!detail ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setDetail(true)}
          >
            Customise
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => save("custom")}
          >
            Save choices
          </button>
        )}
      </div>
    </div>
  );
}

export function openCookieSettings() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("viralyz:open-cookies"));
  }
}
