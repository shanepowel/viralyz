/**
 * Content lint — fails if live Sanity features lack screenshots
 * or posts lack cover alt text.
 *
 * Usage: SANITY_API_READ_TOKEN=... node scripts/content-lint.mjs
 * Skips cleanly when NEXT_PUBLIC_SANITY_PROJECT_ID is unset.
 */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_READ_TOKEN;

if (!projectId) {
  console.log("content-lint: no Sanity project configured — skip");
  process.exit(0);
}

async function groq(query) {
  const url = new URL(
    `https://${projectId}.api.sanity.io/v2026-02-01/data/query/${dataset}`,
  );
  url.searchParams.set("query", query);
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`GROQ ${res.status}`);
  const json = await res.json();
  return json.result;
}

const badFeatures = await groq(`
  *[_type == "feature" && live == true && !defined(screenshot.asset)]{ name, "slug": slug.current }
`);
const badPosts = await groq(`
  *[_type == "post" && (!defined(coverImage.asset) || !defined(coverImage.alt) || coverImage.alt == "")]{
    title, "slug": slug.current
  }
`);

let failed = false;
if (badFeatures?.length) {
  failed = true;
  console.error("Live features missing screenshots:");
  for (const f of badFeatures) console.error(` - ${f.name} (${f.slug})`);
}
if (badPosts?.length) {
  failed = true;
  console.error("Posts missing cover image or alt:");
  for (const p of badPosts) console.error(` - ${p.title} (${p.slug})`);
}

if (failed) process.exit(1);
console.log("content-lint: ok");
