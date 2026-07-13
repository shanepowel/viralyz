import { NextResponse } from "next/server";
import {
  createDb,
  createPackageOrder,
  ensureKitAndPackages,
  hasDatabaseUrl,
} from "@repo/db";
import { brandFeeCents, getKitByHandle } from "@/lib/kits";

type Body = {
  packageId?: string;
  buyerName?: string;
  buyerEmail?: string;
  brandName?: string;
  notes?: string;
};

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

  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured on this deployment" },
      { status: 503 },
    );
  }

  try {
    const db = createDb();
    const mediaKitId = await ensureKitAndPackages(db, {
      id: `kit_${kit.handle}`,
      userId: `demo_${kit.handle}`,
      slug: kit.handle,
      verified: kit.verified,
      sections: {
        displayName: kit.displayName,
        niche: kit.niche,
        followers: kit.followers,
        score: kit.score,
      },
      packages: kit.packages.map((p, i) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        deliveryDays: p.deliveryDays,
        priceCents: p.priceCents,
        currency: p.currency,
        usageRights: p.usageRights,
        sortOrder: i,
      })),
    });

    const order = await createPackageOrder(db, {
      packageId: pkg.id,
      mediaKitId,
      buyerEmail,
      buyerName,
      brandName: (body.brandName || "").trim() || null,
      notes: (body.notes || "").trim() || null,
      amountCents: pkg.priceCents,
      feeCents,
      currency: pkg.currency,
    });

    return NextResponse.json({
      orderId: order.id,
      order,
      persisted: true,
      message:
        "Funds marked as held in escrow. Stripe capture wires before production payments.",
    });
  } catch (err) {
    console.error("package order failed", err);
    return NextResponse.json(
      { error: "Could not create order. Try again." },
      { status: 500 },
    );
  }
}
