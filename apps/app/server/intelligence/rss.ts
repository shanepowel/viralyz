/**
 * Minimal RSS / Atom ingester. Best-effort; no external dependency.
 * Parses <item>/<entry> tags with regex · not bullet-proof XML, but stable
 * enough for the well-formed feeds most B2B blogs emit (Hubspot, Ghost,
 * WordPress, Substack, Webflow). Returns lightweight post records the
 * caller upserts into intel_competitor_posts.
 */
export type RawPost = {
  source: "rss" | "x" | "linkedin";
  externalId: string;
  url: string | null;
  author: string | null;
  title: string | null;
  text: string | null;
  publishedAt: Date | null;
  rawLikes?: number | null;
  rawComments?: number | null;
  rawReposts?: number | null;
  engagers?: Array<{ name: string; title?: string; company?: string }> | null;
};

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)));
}

function pick(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = block.match(re);
  if (!m) return null;
  // Strip CDATA + html.
  return decodeEntities(m[1].replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim());
}

function pickHref(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*href="([^"]+)"`, "i");
  const m = block.match(re);
  return m ? m[1] : null;
}

export async function fetchRss(url: string, withinMs = 14 * 24 * 60 * 60 * 1000): Promise<RawPost[]> {
  let xml: string;
  try {
    const r = await fetch(url, { headers: { "User-Agent": "ViralyzSignal/1.0 (+https://viralyz.app)" } });
    if (!r.ok) return [];
    xml = await r.text();
  } catch {
    return [];
  }
  const cutoff = Date.now() - withinMs;
  const items: RawPost[] = [];
  const itemBlocks =
    xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ||
    xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ||
    [];
  for (const block of itemBlocks.slice(0, 50)) {
    const title = pick(block, "title");
    const link = pick(block, "link") || pickHref(block, "link");
    const description = pick(block, "description") || pick(block, "summary") || pick(block, "content:encoded") || pick(block, "content");
    const pub = pick(block, "pubDate") || pick(block, "published") || pick(block, "updated");
    const author = pick(block, "author") || pick(block, "dc:creator") || pick(block, "name");
    const guid = pick(block, "guid") || pick(block, "id") || link || "";
    const publishedAt = pub ? new Date(pub) : null;
    if (publishedAt && Number.isFinite(publishedAt.getTime()) && publishedAt.getTime() < cutoff) continue;
    if (!guid) continue;
    items.push({
      source: "rss",
      externalId: guid.slice(0, 240),
      url: link,
      author: author?.slice(0, 160) || null,
      title: title?.slice(0, 500) || null,
      text: description?.slice(0, 4000) || null,
      publishedAt: publishedAt && Number.isFinite(publishedAt.getTime()) ? publishedAt : null,
    });
  }
  return items;
}
