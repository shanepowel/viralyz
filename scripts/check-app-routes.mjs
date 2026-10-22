/**
 * Fails when the marketing site links to a product-app page that doesn't
 * exist. Every app link must be one of `appRoutes` in apps/web/lib/site.ts.
 * Usage: node scripts/check-app-routes.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const webDir = path.join(root, "apps", "web");
const siteFile = path.join(webDir, "lib", "site.ts");

const site = readFileSync(siteFile, "utf8");
const block = site.match(/export const appRoutes = \{([\s\S]*?)\} as const;/);
if (!block) {
  console.error("✗ appRoutes not found in apps/web/lib/site.ts");
  process.exit(1);
}
const allowed = new Set(
  [...block[1].matchAll(/:\s*(?:APP_URL|`\$\{APP_URL\}(\/[^`]*)`)/g)].map((m) => m[1] ?? "/"),
);

const SKIP_DIRS = new Set(["node_modules", ".next", ".turbo", "public"]);
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".md", ".mdx", ".json"]);

function* files(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) yield* files(full);
    else if (EXTENSIONS.has(path.extname(name))) yield full;
  }
}

// Literal app links, either spelled out or built from APP_URL.
const LINK = /(?:https:\/\/app\.viralyz\.com|\$\{APP_URL\})(\/[A-Za-z0-9/_-]*)?/g;

let failures = 0;
for (const file of files(webDir)) {
  if (file === siteFile) continue;
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(LINK)) {
    const route = (match[1] ?? "/").replace(/\/$/, "") || "/";
    if (!allowed.has(route)) {
      const line = text.slice(0, match.index).split("\n").length;
      console.error(`✗ ${path.relative(root, file)}:${line} links to app route ${route}, which isn't in appRoutes`);
      failures++;
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} unknown app route(s). Use appRoutes from apps/web/lib/site.ts.`);
  process.exit(1);
}
console.log(`✓ app links OK (${allowed.size} known app routes)`);
