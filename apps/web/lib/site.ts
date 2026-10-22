/** Single source for external links and honest product claims. */

export const APP_URL = "https://app.viralyz.com";
export const SITE_URL = "https://www.viralyz.com";

/**
 * Every product-app page the marketing site may link to. Keep in step with
 * the app's navigation (shanepowel/viralyzapp `AppShell.tsx`);
 * `pnpm check:routes` fails on any app link that isn't listed here.
 */
export const appRoutes = {
  home: APP_URL,
  login: `${APP_URL}/login`,
  discover: `${APP_URL}/discover`,
  brand: `${APP_URL}/brand`,
  studio: `${APP_URL}/studio`,
  creatives: `${APP_URL}/creatives`,
  results: `${APP_URL}/results`,
  account: `${APP_URL}/account`,
} as const;

export const routes = {
  home: "/",
  platform: "/platform",
  forCreators: "/for-creators",
  forBrands: "/for-brands",
  pricing: "/pricing",
  creators: "/creators",
  tools: "/tools",
  blog: "/blog",
  about: "/about",
  trust: "/trust",
  changelog: "/changelog",
  contact: "/contact",
  report: "/report",
  affiliates: "/affiliates",
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
  /** Prefer /login on the product app; falls back to root until that page ships. */
  login: appRoutes.login,
  signup: appRoutes.home,
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
  verifiedCreators: null as number | null,
  videosScored: null as number | null,
  predictionAccuracy: null as string | null,
  avgScoreTime: "<30s",
} as const;

/** Product-truth stats band for the homepage (not usage claims). */
export const productStats = [
  { value: "100", label: "Point score on every video" },
  { value: "5", label: "Areas analyzed per post" },
  { value: "<30s", label: "To your first score" },
  { value: "10", label: "Free scores a month" },
] as const;
