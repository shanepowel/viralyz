import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";


export function pageMeta({
  title,
  description,
  path,
  ogImage,
  robots,
  article,
}: {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  robots?: Metadata["robots"];
  article?: { publishedTime?: string };
}): Metadata {
  const url = `${SITE_URL}${path}`;
  // Each page gets a share image carrying its own title.
  const og = ogImage ?? `/og?title=${encodeURIComponent(title)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots,
    openGraph: {
      title,
      description,
      url,
      siteName: "Viralyz",
      type: article ? "article" : "website",
      images: [{ url: og, width: 1200, height: 630 }],
      ...(article?.publishedTime
        ? { publishedTime: article.publishedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og],
    },
  };
}
