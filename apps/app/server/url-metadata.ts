export interface UrlMetadata {
  title: string;
  description: string;
  platform: string;
  thumbnailUrl?: string;
  author?: string;
}

function detectPlatform(url: string): string {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("youtube") || host.includes("youtu.be")) return "youtube";
    if (host.includes("tiktok")) return "tiktok";
    if (host.includes("instagram")) return "instagram";
    if (host.includes("twitter") || host.includes("x.com")) return "twitter";
    if (host.includes("linkedin")) return "linkedin";
  } catch {
    /* invalid URL */
  }
  return "general";
}

function extractMeta(html: string, property: string): string | undefined {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
      "i",
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return undefined;
}

function extractTitleTag(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1]?.trim();
}

async function fetchOEmbed(
  url: string,
  platform: string,
): Promise<UrlMetadata | null> {
  const oembedUrl =
    platform === "youtube"
      ? `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      : `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;

  const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    title?: string;
    author_name?: string;
    thumbnail_url?: string;
  };

  return {
    title: data.title || url,
    description: data.author_name ? `By ${data.author_name}` : "",
    platform,
    thumbnailUrl: data.thumbnail_url,
    author: data.author_name,
  };
}

export async function fetchUrlMetadata(url: string): Promise<UrlMetadata> {
  const platform = detectPlatform(url);

  try {
    if (platform === "youtube" || platform === "tiktok") {
      const oembed = await fetchOEmbed(url, platform);
      if (oembed) return oembed;
    }

    const pageRes = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ViralyzBot/1.0)" },
      signal: AbortSignal.timeout(8000),
    });

    if (!pageRes.ok) {
      return {
        title: url,
        description: `Linked content from ${platform}`,
        platform,
      };
    }

    const html = await pageRes.text();
    const title =
      extractMeta(html, "og:title") || extractTitleTag(html) || url;
    const description =
      extractMeta(html, "og:description") ||
      extractMeta(html, "description") ||
      "";
    const thumbnailUrl = extractMeta(html, "og:image");

    return { title, description, platform, thumbnailUrl };
  } catch {
    return {
      title: url,
      description: `Linked content from ${platform}`,
      platform,
    };
  }
}
