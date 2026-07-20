import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageCheckout } from "@/components/marketing/package-checkout";
import { DemoBadge } from "@/components/marketing/demo-badge";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import {
  formatGbp,
  getKitByHandle,
  PUBLIC_KITS,
} from "@/lib/kits";
import { flags } from "@/lib/flags";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";

export function generateStaticParams() {
  return PUBLIC_KITS.map((k) => ({ handle: k.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const kit = getKitByHandle(handle);
  if (!kit) return { title: "Media kit" };
  return pageMeta({
    title: `${kit.displayName} · Media kit`,
    description: `${kit.niche} creator · score ${kit.score} · packages from ${formatGbp(kit.packages[0]?.priceCents ?? 0)}.`,
    path: `/kit/${kit.handle}`,
    robots: kit.demo ? { index: false, follow: false } : undefined,
  });
}

export default async function KitPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ package?: string }>;
}) {
  const { handle } = await params;
  const { package: packageId } = await searchParams;
  const kit = getKitByHandle(handle);
  if (!kit) notFound();

  const selected =
    kit.packages.find((p) => p.id === packageId) ?? kit.packages[0] ?? null;

  return (
    <MarketingShell>
      <div className="wrap kit-page">
        <div className="kit-hero">
          <div className="kit-ava-lg" style={{ background: kit.face }}>
            {kit.initials}
          </div>
          <div>
            <span className="eyebrow">Media kit</span>
            <h1>
              {kit.displayName}{" "}
              {kit.demo && !flags.marketplaceLive ? (
                <DemoBadge label="Example media kit" />
              ) : null}
            </h1>
            <p className="handle mono">@{kit.handle}</p>
            <p className="bio">{kit.bio}</p>
            <p className="meta-line">
              {kit.niche}
              {kit.city ? ` · ${kit.city}` : ""} · {kit.followers} followers ·{" "}
              {kit.platform}
            </p>
          </div>
        </div>

        <div className="kit-stats">
          <div className="kit-stat">
            <div className="kv" style={{ color: "var(--s90)" }}>
              {kit.score}
            </div>
            <div className="kl">Viral Score</div>
          </div>
          <div className="kit-stat">
            <div className="kv">{kit.engagement}</div>
            <div className="kl">Engagement</div>
          </div>
          <div className="kit-stat">
            <div className="kv">{kit.avgViews}</div>
            <div className="kl">Avg views</div>
          </div>
          <div className="kit-stat">
            <div className="kv">{kit.followers}</div>
            <div className="kl">Followers</div>
          </div>
        </div>
        <p className="verified-note">
          Example numbers for illustration. When marketplace is live, every
          figure comes from connected platforms, not typed in by the creator.
        </p>

        <div className="kit-grid-2">
          <div>
            <div className="sec-head" style={{ marginBottom: 24 }}>
              <span className="eyebrow">Packages</span>
              <h2>Fixed offers</h2>
              <p>
                Upfront prices. At launch, escrow until you approve. Creators
                keep 100% of the listed price; brands pay a 10% fee on top.
              </p>
            </div>
            <div className="pkg-list">
              {kit.packages.map((pkg) => {
                const active = selected?.id === pkg.id;
                return (
                  <Link
                    key={pkg.id}
                    href={`/kit/${kit.handle}?package=${pkg.id}`}
                    className={`pkg-card${active ? " on" : ""}`}
                    scroll={false}
                  >
                    <div className="pkg-top">
                      <h3>{pkg.name}</h3>
                      <span className="pkg-price mono">
                        {formatGbp(pkg.priceCents)}
                      </span>
                    </div>
                    <p>{pkg.description}</p>
                    <div className="pkg-meta">
                      <span>{pkg.deliveryDays} day delivery</span>
                      <span>{pkg.usageRights}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
          <div>
            {flags.paymentsLive && selected ? (
              <PackageCheckout kit={kit} pkg={selected} />
            ) : (
              <div
                className="rounded-lg border p-6"
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 16,
                  padding: 28,
                  background: "var(--card)",
                }}
              >
                <h3 style={{ marginBottom: 8 }}>Booking opens soon</h3>
                <p style={{ color: "var(--ink-2)", fontSize: 14.5 }}>
                  Packages will be bookable with upfront pricing and escrow.
                  Creators keep 100% of the listed price; brands pay a 10%
                  platform fee.
                </p>
                <Link
                  href={routes.contact}
                  className="btn btn-ghost"
                  style={{ marginTop: 16 }}
                >
                  Get notified at launch
                </Link>
              </div>
            )}
          </div>
        </div>

        <p className="kit-back">
          <Link
            href={routes.creators}
            style={{ color: "var(--violet-deep)" }}
          >
            ← Browse all creators
          </Link>
        </p>
      </div>
    </MarketingShell>
  );
}
