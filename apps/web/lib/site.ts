/** Single source for external links and honest product claims. */

export const APP_URL = "https://app.viralyz.com";
export const SITE_URL = "https://www.viralyz.com";

export const routes = {
  home: "/",
  platform: "/platform",
  forBrands: "/for-brands",
  pricing: "/pricing",
  tools: "/tools",
  blog: "/blog",
  about: "/about",
  trust: "/trust",
  changelog: "/changelog",
  contact: "/contact",
  affiliates: "/affiliates",
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
  login: `${APP_URL}/login`,
  signup: APP_URL,
} as const;

export const CONTACT = {
  hello: "hello@viralyz.com",
  partnerships: "partnerships@viralyz.com",
} as const;

/** Digiteq Holdings Limited — public company details for trust surfaces. */
export const COMPANY = {
  legalName: "Digiteq Holdings Limited",
  number: "16095214",
  location: "Windsor, UK",
} as const;

/**
 * Honest, sustainable claims only. Anything we cannot evidence is null
 * and the consuming component must render its fallback (or nothing).
 */
export const stats = {
  activeSellers: null as number | null,
  variantsGenerated: null as number | null,
  calibrationRho: null as string | null,
} as const;

/** Product-truth stats band for the homepage (structural facts, not usage claims). */
export const productStats = [
  { value: "4", label: "Ad placements supported" },
  { value: "9", label: "Automated checks before you spend" },
  { value: "10", label: "Free credits on signup" },
  { value: "20", label: "Matched ads to unlock calibration" },
] as const;
