/**
 * Backfill script: map legacy content_analyses → content_items + analyses
 *
 * Usage (from repo root, with DATABASE_URL set):
 *   pnpm --filter @repo/db exec tsx ../../scripts/backfill-content-graph.ts
 *
 * Safe to re-run: skips content_analyses already linked via legacy_analysis_id.
 */
import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const sql = neon(url);

  // Ensure tables exist (no-op if already pushed)
  console.log("Checking content_items / analyses tables…");
  try {
    await sql`SELECT 1 FROM content_items LIMIT 1`;
  } catch {
    console.error(
      "content_items missing. Run: pnpm --filter @repo/db push (with DATABASE_URL)",
    );
    process.exit(1);
  }

  const legacy = await sql`
    SELECT id, user_id, content_type, title, description, file_url, thumbnail_url,
           target_platform, viral_score, hook_score, visual_score, structure_score,
           metadata_score, timing_score, analysis_results, suggestions, status,
           scheduled_for, posted_at, created_at, updated_at
    FROM content_analyses
    WHERE id NOT IN (
      SELECT legacy_analysis_id FROM content_items WHERE legacy_analysis_id IS NOT NULL
    )
    ORDER BY created_at ASC
  `;

  console.log(`Found ${legacy.length} analyses to backfill`);

  let created = 0;
  for (const row of legacy) {
    const type =
      row.content_type === "article"
        ? "article"
        : row.content_type === "image"
          ? "image"
          : "video";

    const status =
      row.status === "posted" || row.status === "scheduled" || row.status === "analyzed"
        ? row.status
        : row.viral_score != null
          ? "analyzed"
          : "draft";

    const [item] = await sql`
      INSERT INTO content_items (
        user_id, type, target_platform, title, description, status,
        scheduled_for, posted_at, legacy_analysis_id, created_at, updated_at
      ) VALUES (
        ${row.user_id}, ${type}, ${row.target_platform}, ${row.title}, ${row.description},
        ${status}, ${row.scheduled_for}, ${row.posted_at}, ${row.id},
        ${row.created_at}, ${row.updated_at}
      )
      RETURNING id
    `;

    if (row.file_url) {
      await sql`
        INSERT INTO assets (content_id, kind, url, meta)
        VALUES (${item.id}, 'video', ${row.file_url}, ${JSON.stringify({})})
      `;
    }
    if (row.thumbnail_url) {
      await sql`
        INSERT INTO assets (content_id, kind, url, meta)
        VALUES (${item.id}, 'thumbnail', ${row.thumbnail_url}, ${JSON.stringify({})})
      `;
    }

    if (row.viral_score != null) {
      await sql`
        INSERT INTO analyses (
          content_id, version, viral_score, hook, visual, structure, metadata, timing,
          results, suggestions, scoring_profile_version
        ) VALUES (
          ${item.id}, 1, ${row.viral_score}, ${row.hook_score}, ${row.visual_score},
          ${row.structure_score}, ${row.metadata_score}, ${row.timing_score},
          ${JSON.stringify(row.analysis_results ?? {})},
          ${JSON.stringify(row.suggestions ?? {})},
          'legacy-v1'
        )
      `;
    }

    created += 1;
  }

  console.log(`Backfill complete: ${created} content_items created`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
