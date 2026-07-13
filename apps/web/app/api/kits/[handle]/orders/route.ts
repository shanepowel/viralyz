import { NextResponse } from "next/server";
import {
  brandFeeCents,
  getKitByHandle,
} from "@/lib/kits";

type Body = {
  packageId?: string;
  buyerName?: string;
  buyerEmail?: string;
  brandName?: string;
  notes?: string;
};

/**
 * Creates a package order in escrow.
 * Persists to package_orders when DATABASE_URL is wired; otherwise returns a
 * demo order id so the marketing checkout flow is end-to-end testable.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ handle: string }> },
) {
  const { handle } = await ctx.params;
  const kit = getKitByHandle(handle);
  if (!kit) {
    return NextResponse.json({ error: "Kit not found" }, { status: 404 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const pkg = kit.packages.find((p) => p.id === body.packageId);
  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }
  const buyerName = (body.buyerName || "").trim();
  const buyerEmail = (body.buyerEmail || "").trim().toLowerCase();
  if (!buyerName || !buyerEmail || !buyerEmail.includes("@")) {
    return NextResponse.json(
      { error: "Name and a valid email are required" },
      { status: 400 },
    );
  }

  const feeCents = brandFeeCents(pkg.priceCents);
  const orderId = `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const autoApproveAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // TODO: insert into package_orders via @repo/db when web has a DB client.
  const order = {
    id: orderId,
    packageId: pkg.id,
    mediaKitHandle: kit.handle,
    buyerName,
    buyerEmail,
    brandName: (body.brandName || "").trim() || null,
    notes: (body.notes || "").trim() || null,
    amountCents: pkg.priceCents,
    feeCents,
    currency: pkg.currency,
    status: "new",
    escrowHeldAt: new Date().toISOString(),
    autoApproveAt,
  };

  return NextResponse.json({
    orderId: order.id,
    order,
    message:
      "Funds marked as held in escrow. Stripe capture wires before production payments.",
  });
}
