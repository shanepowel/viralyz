/**
 * Funding-signal ingester. Parses a funding / news RSS feed (e.g. a
 * Crunchbase org RSS, a Google News query feed, or the company's own
 * press-release feed) and keeps only items whose title/summary look like a
 * funding event. Reuses the dependency-free RSS parser from ./rss. Best-effort:
 * returns [] on any failure.
 */
import { fetchRss } from "./rss";

export type RawFundingSignal = {
  externalId: string;
  title: string;
  url: string | null;
  amount: string | null;
  publishedAt: Date | null;
};

const FUNDING_RE =
  /\b(raise[sd]?|raising|funding|funded|series\s+[a-e]\b|seed\b|pre[-\s]?seed|round|venture|investment|invested|backed|valuation|acqui|ipo\b|financing)\b/i;

// Pull a "$12M" / "$1.2 billion" style amount out of the text if present.
const AMOUNT_RE = /\$\s?\d[\d,.]*\s?(?:k|m|b|bn|billion|million|thousand)?/i;

export async function fetchFundingSignals(fundingRssUrl: string): Promise<RawFundingSignal[]> {
  let items;
  try {
    // Look back further than the content feeds — funding news is sparse.
    items = await fetchRss(fundingRssUrl, 90 * 24 * 60 * 60 * 1000);
  } catch {
    return [];
  }
  const out: RawFundingSignal[] = [];
  for (const it of items) {
    const haystack = `${it.title || ""} ${it.text || ""}`;
    if (!FUNDING_RE.test(haystack)) continue;
    const amountMatch = haystack.match(AMOUNT_RE);
    out.push({
      externalId: it.externalId,
      title: (it.title || it.text || "Funding update").slice(0, 500),
      url: it.url,
      amount: amountMatch ? amountMatch[0].replace(/\s+/g, "").slice(0, 80) : null,
      publishedAt: it.publishedAt,
    });
  }
  return out;
}
