"use client";

import { useState } from "react";
import {
  brandFeeCents,
  brandTotalCents,
  formatGbp,
  type KitPackage,
  type PublicKit,
} from "@/lib/kits";

export function PackageCheckout({
  kit,
  pkg,
}: {
  kit: PublicKit;
  pkg: KitPackage;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brand, setBrand] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ orderId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fee = brandFeeCents(pkg.priceCents);
  const total = brandTotalCents(pkg.priceCents);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/kits/${kit.handle}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          buyerName: name,
          buyerEmail: email,
          brandName: brand,
          notes,
        }),
      });
      const data = (await res.json()) as { orderId?: string; error?: string };
      if (!res.ok || !data.orderId) {
        setError(data.error || "Could not start the order. Try again.");
        return;
      }
      setDone({ orderId: data.orderId });
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="pkg-checkout done">
        <h3>Money held safely.</h3>
        <p>
          Order <span className="mono">{done.orderId}</span> is in escrow.{" "}
          {kit.displayName} will accept and deliver within {pkg.deliveryDays}{" "}
          days. Funds release when you approve, or automatically after 7 days of
          silence.
        </p>
        <p className="fine">
          Creators keep 100% of {formatGbp(pkg.priceCents)}. You paid{" "}
          {formatGbp(total)} including the 10% platform fee.
        </p>
      </div>
    );
  }

  return (
    <form className="pkg-checkout" onSubmit={(e) => void submit(e)}>
      <h3>Book this package</h3>
      <p className="lede-sm">
        Pay upfront. Viralyz holds the money until the work is approved.
        Creators keep 100%.
      </p>
      <div className="pkg-totals">
        <div>
          <span>Package</span>
          <b>{formatGbp(pkg.priceCents)}</b>
        </div>
        <div>
          <span>Platform fee (10%)</span>
          <b>{formatGbp(fee)}</b>
        </div>
        <div className="total">
          <span>You pay</span>
          <b>{formatGbp(total)}</b>
        </div>
      </div>
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
        Work email
        <input
          className="c-input"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        Brand or company
        <input
          className="c-input"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
      </label>
      <label>
        Notes for the creator
        <textarea
          className="c-input"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="btn btn-violet" disabled={busy}>
        {busy ? "Holding funds…" : `Pay ${formatGbp(total)} into escrow`}
      </button>
      <p className="fine">
        Stripe checkout wires in before live payments. This flow creates the
        order record and escrow state.
      </p>
    </form>
  );
}
