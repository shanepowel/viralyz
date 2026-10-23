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

/**
 * Product facts the marketing pages render in place of the design's
 * [N] / [PRICE] / [threshold] placeholders. Keep in sync with the app
 * (shanepowel/viralyzapp): signup grant, credits per variant, and the
 * Results calibration threshold.
 */
export const productFacts = {
  /** Credits granted on signup. */
  freeCredits: 10,
  /** Credits charged per generated variant (one placement). */
  creditsPerVariant: 1,
  /** Matched ads needed before Results shows a calibration reading. */
  calibrationThreshold: 20,
  /** Number of pre-flight checks shown per variant (five rules + hook estimate). */
  preflightChecks: 6,
  /** Minimum text contrast (WCAG AA, normal text) the contrast check enforces. */
  contrastMin: "4.5:1",
  /** Meta feed/Stories primary-text limit the character check warns at. */
  primaryTextMax: 125,
} as const;

/** Placements the app generates and checks for (viralyzapp lib/preflight/placements). */
export const placements = [
  "Meta feed 4:5",
  "Meta feed 1:1",
  "Stories 9:16",
  "TikTok 9:16",
] as const;

export type CreditPack = {
  name: string;
  credits: number;
  /** Price in GBP pence. */
  pricePence: number;
  description: string;
  href: string;
};

/**
 * Self-serve credit packs. Empty until payments are live: the pricing page
 * then shows the free card and a "talk to us" card instead of invented prices.
 */
export const creditPacks: CreditPack[] = [];

/** How prices are quoted, e.g. "inc. VAT". null until confirmed. */
export const vatNote: string | null = null;

/**
 * What a credit buys. Only generation spends credits in the app today;
 * everything else is included.
 */
export const creditCosts = [
  { action: "Browse reference ads in Discover", credits: 0 },
  { action: "Import a brand from a store URL", credits: 0 },
  { action: "Generate one variant, one placement", credits: productFacts.creditsPerVariant },
  { action: "Pre-flight a variant", credits: 0 },
  { action: "Import and match a spend export", credits: 0 },
] as const;

/**
 * Real Results data for the marketing site. The site has no account data,
 * so this stays null and every chart renders its locked state.
 */
export const calibration = {
  matched: null as number | null,
  rho: null as string | null,
} as const;
