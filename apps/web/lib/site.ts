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
  pricing: "/pricing",
  blog: "/blog",
  about: "/about",
  trust: "/trust",
  changelog: "/changelog",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
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
 * Product facts the copy leans on, mirrored from the app (shanepowel/viralyzapp).
 * Change them here when the app changes, never in page copy.
 */
export const productFacts = {
  /** Credits granted on signup (`users.ts` opening balance). */
  signupCredits: 10,
  /** Default `CREDIT_PRICE_PER_VARIANT`; a deployment can raise it. */
  creditsPerVariant: 1,
  /** Pre-flight headline stays blank until this many checks are scored (`aggregate.ts`). */
  minScoredChecks: 4,
  /** Calibration needs this many matched ads (`calibration.ts`)… */
  calibrationMinAds: 20,
  /** …each with at least this many impressions. */
  calibrationMinImpressions: 1000,
} as const;

/** Product-truth band for the homepage: what the product does, not usage claims. */
export const productStats = [
  { value: "2", label: "Official ad libraries searched (Meta EU/UK, TikTok)" },
  { value: "4", label: "Placements checked: feed 1:1, feed 4:5, Stories, TikTok" },
  { value: "10", label: "Pre-flight checks on every variant" },
  { value: "10", label: "Free credits when you sign up" },
] as const;
