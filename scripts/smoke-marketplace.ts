/**
 * Quick marketplace persistence smoke test.
 *   DATABASE_URL=… pnpm exec tsx scripts/smoke-marketplace.ts
 */
import {
  createDb,
  createPackageOrder,
  ensureKitAndPackages,
  upsertAffiliate,
  upsertReportLead,
} from "../packages/db/src/index.ts";

async function main() {
  const db = createDb();
  const mediaKitId = await ensureKitAndPackages(db, {
    id: "kit_smoke",
    userId: "demo_smoke",
    slug: "smoke-test",
    verified: false,
    sections: { displayName: "Smoke" },
    packages: [
      {
        id: "smoke-pkg",
        name: "Smoke",
        description: "t",
        deliveryDays: 1,
        priceCents: 1000,
        currency: "GBP",
        usageRights: "n",
        sortOrder: 0,
      },
    ],
  });
  const order = await createPackageOrder(db, {
    packageId: "smoke-pkg",
    mediaKitId,
    buyerEmail: `smoke-${Date.now()}@example.com`,
    buyerName: "Smoke",
    amountCents: 1000,
    feeCents: 100,
    currency: "GBP",
  });
  const aff = await upsertAffiliate(db, {
    email: "aff-smoke@example.com",
    name: "Aff Smoke",
    code: "affsmoke1",
    channel: "x",
  });
  const lead = await upsertReportLead(db, {
    email: "lead-smoke@example.com",
    reportSlug: "viral-score-report-2026",
    source: "smoke",
  });
  console.log(
    JSON.stringify(
      {
        mediaKitId,
        orderId: order.id,
        affId: aff.id,
        leadId: lead.id,
        persisted: true,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
