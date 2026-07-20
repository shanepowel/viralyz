import { and, eq } from "drizzle-orm";
import { createDb, hasDatabaseUrl, type Db } from "./client";
import {
  affiliates,
  kitPackages,
  mediaKits,
  packageOrders,
  reportLeads,
} from "./schema";

export type SeedPackage = {
  id: string;
  name: string;
  description: string;
  deliveryDays: number;
  priceCents: number;
  currency: string;
  usageRights: string;
  sortOrder: number;
};

export type SeedKit = {
  id: string;
  userId: string;
  slug: string;
  verified: boolean;
  sections: Record<string, unknown>;
  packages: SeedPackage[];
};

export async function ensureKitAndPackages(db: Db, kit: SeedKit) {
  const existing = await db
    .select()
    .from(mediaKits)
    .where(eq(mediaKits.slug, kit.slug))
    .limit(1);

  let mediaKitId = existing[0]?.id;
  if (!mediaKitId) {
    const [row] = await db
      .insert(mediaKits)
      .values({
        id: kit.id,
        userId: kit.userId,
        slug: kit.slug,
        sections: kit.sections,
        verified: kit.verified,
        publishedAt: new Date(),
      })
      .returning({ id: mediaKits.id });
    mediaKitId = row!.id;
  } else {
    await db
      .update(mediaKits)
      .set({
        sections: kit.sections,
        verified: kit.verified,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(mediaKits.id, mediaKitId));
  }

  for (const pkg of kit.packages) {
    const found = await db
      .select()
      .from(kitPackages)
      .where(eq(kitPackages.id, pkg.id))
      .limit(1);
    if (found[0]) {
      await db
        .update(kitPackages)
        .set({
          mediaKitId,
          name: pkg.name,
          description: pkg.description,
          deliveryDays: pkg.deliveryDays,
          priceCents: pkg.priceCents,
          currency: pkg.currency,
          usageRights: pkg.usageRights,
          sortOrder: pkg.sortOrder,
          active: true,
          updatedAt: new Date(),
        })
        .where(eq(kitPackages.id, pkg.id));
    } else {
      await db.insert(kitPackages).values({
        id: pkg.id,
        mediaKitId,
        name: pkg.name,
        description: pkg.description,
        deliveryDays: pkg.deliveryDays,
        priceCents: pkg.priceCents,
        currency: pkg.currency,
        usageRights: pkg.usageRights,
        sortOrder: pkg.sortOrder,
        active: true,
      });
    }
  }

  return mediaKitId;
}

export async function createPackageOrder(
  db: Db,
  input: {
    packageId: string;
    mediaKitId: string;
    buyerEmail: string;
    buyerName: string;
    brandName?: string | null;
    notes?: string | null;
    amountCents: number;
    feeCents: number;
    currency: string;
  },
) {
  const autoApproveAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const [row] = await db
    .insert(packageOrders)
    .values({
      packageId: input.packageId,
      mediaKitId: input.mediaKitId,
      buyerEmail: input.buyerEmail,
      buyerName: input.buyerName,
      brandName: input.brandName || null,
      notes: input.notes || null,
      amountCents: input.amountCents,
      feeCents: input.feeCents,
      currency: input.currency,
      status: "new",
      escrowHeldAt: new Date(),
      autoApproveAt,
    })
    .returning();
  return row!;
}

export async function upsertAffiliate(
  db: Db,
  input: {
    email: string;
    name: string;
    code: string;
    channel?: string | null;
  },
) {
  const existing = await db
    .select()
    .from(affiliates)
    .where(eq(affiliates.email, input.email))
    .limit(1);
  if (existing[0]) {
    return existing[0];
  }
  const [row] = await db
    .insert(affiliates)
    .values({
      email: input.email,
      name: input.name,
      code: input.code,
      status: "pending",
      commissionBps: 3000,
      recurringMonths: 12,
      payoutDetails: input.channel ? { channel: input.channel } : null,
    })
    .returning();
  return row!;
}

export async function upsertReportLead(
  db: Db,
  input: { email: string; reportSlug: string; source?: string | null },
) {
  const existing = await db
    .select()
    .from(reportLeads)
    .where(
      and(
        eq(reportLeads.email, input.email),
        eq(reportLeads.reportSlug, input.reportSlug),
      ),
    )
    .limit(1);
  if (existing[0]) return existing[0];

  try {
    const [row] = await db
      .insert(reportLeads)
      .values({
        email: input.email,
        reportSlug: input.reportSlug,
        source: input.source || "web",
      })
      .returning();
    return row!;
  } catch {
    const again = await db
      .select()
      .from(reportLeads)
      .where(
        and(
          eq(reportLeads.email, input.email),
          eq(reportLeads.reportSlug, input.reportSlug),
        ),
      )
      .limit(1);
    if (again[0]) return again[0];
    throw new Error("Could not save report lead");
  }
}

export { createDb, hasDatabaseUrl };
export type { Db };
