/**
 * Seeds the Sanity project with the content the site already ships in code:
 * settings, the three notes with their covers, the five platform features
 * with their screenshots, and the legal pages.
 *
 *   pnpm --filter studio seed:dry   builds every document and prints a summary, writes nothing
 *   pnpm --filter studio seed       writes to Sanity (needs SANITY_API_WRITE_TOKEN)
 *
 * Reads variables from the environment, or from .env.seed / .env.local / .env
 * in the repo root or apps/studio. Safe to run again: every document has a
 * fixed id and is replaced, never duplicated. It deletes nothing.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import { features } from "../../web/data/features";
import { LEGAL_UPDATED, privacySections, termsSections, type LegalSection } from "../../web/data/legal";
import { BLOG_CATEGORIES, PLACEHOLDER_POSTS } from "../../web/lib/blog";
import { COMPANY, CONTACT } from "../../web/lib/site";

const DRY = process.argv.includes("--dry");
const STUDIO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = path.resolve(STUDIO, "../..");
const WEB_PUBLIC = path.resolve(ROOT, "apps/web/public");

function loadEnvFiles() {
  for (const dir of [STUDIO, ROOT]) {
    for (const name of [".env.seed", ".env.local", ".env"]) {
      const file = path.join(dir, name);
      if (!existsSync(file)) continue;
      for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
        const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (!m || process.env[m[1]!] !== undefined) continue;
        process.env[m[1]!] = m[2]!.replace(/^(['"])(.*)\1$/, "$2");
      }
    }
  }
}
loadEnvFiles();

const env = (...names: string[]) => names.map((n) => process.env[n]?.trim()).find(Boolean);
const projectId = env("SANITY_STUDIO_PROJECT_ID", "NEXT_PUBLIC_SANITY_PROJECT_ID", "SANITY_API_PROJECT_ID");
const dataset = env("SANITY_STUDIO_DATASET", "NEXT_PUBLIC_SANITY_DATASET", "SANITY_API_DATASET") ?? "production";
const token = env("SANITY_API_WRITE_TOKEN", "SANITY_AUTH_TOKEN");

if (!DRY && (!projectId || !token)) {
  console.error(
    [
      "Cannot seed: missing " + [!projectId && "the Sanity project id", !token && "SANITY_API_WRITE_TOKEN"].filter(Boolean).join(" and ") + ".",
      "Pull them from Vercel into a file this script reads, then run it again:",
      "  npx vercel env pull .env.seed --environment=production",
      "  pnpm --filter studio seed",
    ].join("\n"),
  );
  process.exit(1);
}

const client = DRY
  ? null
  : createClient({ projectId: projectId!, dataset, apiVersion: "2026-02-01", token, useCdn: false });

type Doc = Record<string, unknown> & { _id: string; _type: string };
const docs: Doc[] = [];
const uploads: string[] = [];

const key = (seed: string) => createHash("sha1").update(seed).digest("hex").slice(0, 12);

function block(text: string, style: "normal" | "h2" = "normal") {
  const k = key(style + text);
  return {
    _type: "block" as const,
    _key: k,
    style,
    markDefs: [],
    children: [{ _type: "span" as const, _key: `${k}s`, text, marks: [] }],
  };
}

const legalBody = (sections: LegalSection[]) =>
  sections.flatMap((s) => [block(s.heading, "h2"), ...s.body.map((p) => block(p))]);

/** Uploads a file from apps/web/public and returns an image field. The same bytes are never stored twice. */
async function image(publicPath: string, alt: string) {
  const file = path.join(WEB_PUBLIC, publicPath);
  if (!existsSync(file)) throw new Error(`Missing image: ${file}`);
  uploads.push(publicPath);
  if (!client) return { _type: "image" as const, asset: { _type: "reference" as const, _ref: `image-dry-${key(publicPath)}` }, alt };
  const asset = await client.assets.upload("image", readFileSync(file), {
    filename: path.basename(publicPath),
    contentType: "image/png",
  });
  return { _type: "image" as const, asset: { _type: "reference" as const, _ref: asset._id }, alt };
}

const slug = (current: string) => ({ _type: "slug" as const, current });
const ref = (_ref: string) => ({ _type: "reference" as const, _ref });

/** Platform groups, in the order the product is used. Matches the site's fallback. */
const GROUPS = ["Prepare", "Prepare", "Make and check", "Make and check", "Learn"];

async function build() {
  docs.push({
    _id: "siteSettings",
    _type: "siteSettings",
    siteName: "Viralyz",
    missionLine: "Make the ad. Mark it up. Then spend on it.",
    companyNumber: COMPANY.number,
    companyLocation: COMPANY.location,
    parentCompany: COMPANY.legalName,
    helloEmail: CONTACT.hello,
    partnershipsEmail: CONTACT.partnerships,
    defaultOgImage: await image("og-default.png", "Viralyz: make the ad, mark it up, then spend on it"),
  });

  docs.push({
    _id: "author-viralyz",
    _type: "author",
    name: "Viralyz",
    role: "Product",
    bio: "Notes from building and checking ad creative.",
  });

  for (const c of BLOG_CATEGORIES) {
    docs.push({ _id: `category-${c.slug}`, _type: "category", title: c.title, slug: slug(c.slug), accentTone: "neutral" });
  }

  for (const [i, post] of PLACEHOLDER_POSTS.entries()) {
    docs.push({
      _id: `post-${post.slug}`,
      _type: "post",
      title: post.title,
      slug: slug(post.slug),
      excerpt: post.excerpt,
      category: ref(`category-${post.category.slug}`),
      author: ref("author-viralyz"),
      publishedAt: post.publishedAt,
      featured: i === 0,
      ...(post.cover ? { coverImage: await image(post.cover.src.replace(/^\//, ""), post.cover.alt) } : {}),
      body: post.bodyHtml.map((p) => block(p)),
      ...(post.seoTitle ? { seoTitle: post.seoTitle } : {}),
      ...(post.seoDescription ? { seoDescription: post.seoDescription } : {}),
    });
  }

  for (const [i, f] of features.entries()) {
    docs.push({
      _id: `feature-${f.slug}`,
      _type: "feature",
      name: f.name,
      slug: slug(f.slug),
      group: GROUPS[i] ?? "Learn",
      tagline: f.tagline,
      summary: f.description,
      bullets: f.bullets,
      appHref: f.appHref,
      order: i + 1,
      live: true,
      screenshot: await image(f.screenshot.src.replace(/^\//, ""), f.screenshot.alt),
    });
  }

  // "13 November 2026" in the code; Sanity's date field wants ISO.
  const lastUpdated = new Date(`${LEGAL_UPDATED} UTC`).toISOString().slice(0, 10);
  docs.push(
    { _id: "legal-privacy", _type: "legalPage", title: "Privacy policy", slug: slug("privacy"), lastUpdated, body: legalBody(privacySections) },
    { _id: "legal-terms", _type: "legalPage", title: "Terms of service", slug: slug("terms"), lastUpdated, body: legalBody(termsSections) },
    {
      _id: "legal-cookies",
      _type: "legalPage",
      title: "Cookies",
      slug: slug("cookies"),
      lastUpdated,
      body: legalBody([
        {
          heading: "What we use",
          body: [
            "This website uses privacy-friendly analytics that set no cookies and do not track you across sites.",
            "The Viralyz app sets essential cookies only: one keeps you signed in, and one remembers your theme. They are needed for the app to work, so they do not ask for consent.",
          ],
        },
        {
          heading: "Your choices",
          body: [
            "If we add anything that sets optional cookies, this site asks first, and you can change your answer at any time from the cookie settings.",
            `Questions about cookies or tracking: ${CONTACT.hello}.`,
          ],
        },
      ]),
    },
  );
}

async function main() {
  await build();
  const byType = docs.reduce<Record<string, number>>((m, d) => ({ ...m, [d._type]: (m[d._type] ?? 0) + 1 }), {});
  const summary = Object.entries(byType).map(([t, n]) => `${n} ${t}`).join(", ");

  if (DRY) {
    if (process.argv.includes("--json")) {
      console.log(JSON.stringify(docs));
      return;
    }
    console.log(`Dry run. Would write ${docs.length} documents (${summary}) and upload ${uploads.length} images:`);
    for (const u of uploads) console.log(`  ${u}`);
    console.log("Nothing was written.");
    return;
  }

  console.log(`Seeding Sanity project ${projectId}, dataset ${dataset}.`);
  const tx = client!.transaction();
  for (const doc of docs) tx.createOrReplace(doc);
  await tx.commit();
  console.log(`Wrote ${docs.length} documents (${summary}) and uploaded ${uploads.length} images.`);
  console.log("The site picks the new content up within a few minutes.");
}

main().catch((err) => {
  console.error("Seed failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
