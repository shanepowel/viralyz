/**
 * Crawls the local marketing build, fails on broken internal links and banned strings.
 * Usage: CHECK_ORIGIN=http://localhost:3000 node scripts/check-site.mjs
 */
const ORIGIN = process.env.CHECK_ORIGIN ?? "http://localhost:3000";
const BANNED = [
  "Stripe checkout wires in",
  "ships with the first data release",
  "first partner cohort",
  "2,140",
  "2.1M",
  "4,120",
  "6,340",
  "Trusted by teams at",
  "millions of scored posts",
  "just booked a brand deal",
  "Predictions right",
  "Video scoring",
  "Hook tester",
];

const seen = new Set();
const queue = ["/"];
let failures = 0;

async function main() {
  while (queue.length) {
    const path = queue.shift();
    if (seen.has(path)) continue;
    seen.add(path);

    let res;
    try {
      res = await fetch(ORIGIN + path, { redirect: "manual" });
    } catch (err) {
      console.error(`✗ fetch failed ${path}: ${err.message}`);
      failures++;
      continue;
    }

    // Follow same-origin redirects into the crawl
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (loc) {
        try {
          const u = new URL(loc, ORIGIN);
          if (u.origin === new URL(ORIGIN).origin && !seen.has(u.pathname)) {
            queue.push(u.pathname);
          }
        } catch {
          /* ignore */
        }
      }
      continue;
    }

    if (res.status >= 400) {
      console.error(`✗ ${res.status} ${path}`);
      failures++;
      continue;
    }

    const html = await res.text();

    for (const s of BANNED) {
      if (html.includes(s)) {
        console.error(`✗ banned string "${s}" on ${path}`);
        failures++;
      }
    }

    for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) {
      const href = m[1];
      if (!seen.has(href) && !href.startsWith("/api/")) queue.push(href);
    }
  }

  console.log(`Checked ${seen.size} pages, ${failures} failures.`);
  process.exit(failures ? 1 : 0);
}

main();
