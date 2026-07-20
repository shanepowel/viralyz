import type { MetadataRoute } from "next";
import { routes } from "@/lib/site";
import { features } from "@/data/features";
import { PLACEHOLDER_POSTS } from "@/lib/blog";
import { liveTools } from "@/data/tools";

const SITE = "https://www.viralyz.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const statics = [
    routes.home,
    routes.platform,
    routes.forCreators,
    routes.forBrands,
    routes.pricing,
    routes.creators,
    routes.tools,
    routes.blog,
    routes.about,
    routes.trust,
    routes.changelog,
    routes.contact,
    routes.affiliates,
    routes.report,
    routes.privacy,
    routes.terms,
    routes.cookies,
  ].map((p) => ({
    url: `${SITE}${p === "/" ? "" : p}`,
    changeFrequency: "weekly" as const,
  }));

  return [
    ...statics,
    ...features.map((f) => ({
      url: `${SITE}/platform/${f.slug}`,
      changeFrequency: "monthly" as const,
    })),
    ...liveTools().map((t) => ({
      url: `${SITE}/tools/${t.slug}`,
      changeFrequency: "monthly" as const,
    })),
    ...PLACEHOLDER_POSTS.map((p) => ({
      url: `${SITE}/blog/${p.slug}`,
      lastModified: p.publishedAt,
    })),
  ];
}
