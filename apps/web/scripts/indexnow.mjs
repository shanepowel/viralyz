// Tells Bing (and other IndexNow engines) which URLs exist after a production build.
// Usage: node scripts/indexnow.mjs <https://www.example.com> <key>
// Never fails the build: any error is logged and the script exits 0.
const [site, key] = process.argv.slice(2);

async function main() {
  if (process.env.VERCEL_ENV !== "production") {
    console.log("[indexnow] skipped: not a production build");
    return;
  }
  const host = new URL(site).host;
  const xml = await fetch(`${site}/sitemap.xml`).then((r) => r.text());
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].trim())
    .filter((u) => new URL(u).host === host)
    .slice(0, 10000);
  if (urls.length === 0) {
    console.log("[indexnow] no URLs found in sitemap");
    return;
  }
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation: `${site}/${key}.txt`, urlList: urls }),
  });
  console.log(`[indexnow] submitted ${urls.length} URLs for ${host}: HTTP ${res.status}`);
}

main().catch((err) => console.log(`[indexnow] skipped: ${err.message}`));
