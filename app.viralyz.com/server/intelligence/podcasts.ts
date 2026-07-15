/**
 * Podcast-appearance ingester. Uses the public iTunes Search API (no auth,
 * no key) to find podcast EPISODES that mention a competitor's execs by name.
 * Best-effort: returns [] on any failure or when no exec names are provided.
 * The iTunes episode entity is the closest public "search by guest" surface
 * that doesn't require scraping Apple/Spotify.
 */

export type RawPodcastSignal = {
  externalId: string;
  guest: string | null;
  showName: string | null;
  episodeTitle: string;
  url: string | null;
  publishedAt: Date | null;
};

async function searchEpisodesForGuest(name: string): Promise<RawPodcastSignal[]> {
  const term = encodeURIComponent(name.trim());
  if (!term) return [];
  const url = `https://itunes.apple.com/search?media=podcast&entity=podcastEpisode&limit=10&term=${term}`;
  let j: any;
  try {
    const r = await fetch(url, { headers: { "User-Agent": "ViralyzSignal/1.0 (+https://viralyz.app)" } });
    if (!r.ok) return [];
    j = await r.json();
  } catch {
    return [];
  }
  const results: any[] = Array.isArray(j?.results) ? j.results : [];
  const lname = name.toLowerCase();
  const out: RawPodcastSignal[] = [];
  for (const ep of results) {
    const episodeTitle: string = ep.trackName || "";
    const desc: string = ep.description || ep.shortDescription || "";
    // Only keep episodes that actually reference the exec by name in the
    // title or description — the search API is fuzzy, so this filters noise.
    if (!episodeTitle && !desc) continue;
    if (!(`${episodeTitle} ${desc}`.toLowerCase().includes(lname))) continue;
    const id = ep.trackId ? String(ep.trackId) : (ep.episodeGuid || ep.trackViewUrl || "");
    if (!id) continue;
    out.push({
      externalId: String(id).slice(0, 240),
      guest: name.slice(0, 200),
      showName: ep.collectionName ? String(ep.collectionName).slice(0, 300) : null,
      episodeTitle: (episodeTitle || "Podcast appearance").slice(0, 500),
      url: ep.trackViewUrl || ep.episodeUrl || ep.collectionViewUrl || null,
      publishedAt: ep.releaseDate ? new Date(ep.releaseDate) : null,
    });
  }
  return out;
}

export async function fetchPodcastSignals(execNames: string[] | null | undefined): Promise<RawPodcastSignal[]> {
  const names = (execNames || []).map((n) => (n || "").trim()).filter(Boolean).slice(0, 5);
  if (names.length === 0) return [];
  const all: RawPodcastSignal[] = [];
  const seen = new Set<string>();
  for (const name of names) {
    try {
      const eps = await searchEpisodesForGuest(name);
      for (const ep of eps) {
        if (seen.has(ep.externalId)) continue;
        seen.add(ep.externalId);
        all.push(ep);
      }
    } catch {}
  }
  return all;
}
