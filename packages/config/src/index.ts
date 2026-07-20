/**
 * Viralyz shared product config — Signal / v2.0 positioning & pricing
 */

export type ToolId =
  | "score-engine"
  | "hook-lab"
  | "script-doctor"
  | "caption-studio"
  | "thumbnail-studio"
  | "idea-generator"
  | "trend-radar"
  | "competitor-intel"
  | "profile-analysis"
  | "auto-dm"
  | "content-calendar"
  | "biopage"
  | "media-kit";

export interface ToolDefinition {
  id: ToolId;
  name: string;
  description: string;
  href: string;
  icon: string;
  category: "create" | "analyze" | "grow" | "publish" | "intelligence";
  module: "A" | "B" | "C" | "D" | "E" | "G";
}

export const TOOLS: ToolDefinition[] = [
  {
    id: "score-engine",
    name: "Viral Score",
    description:
      "Five-component score (0–100) with platform-tuned models and fix cards that predict impact.",
    href: "/analyze",
    icon: "TrendingUp",
    category: "analyze",
    module: "A",
  },
  {
    id: "hook-lab",
    name: "Hook Lab",
    description:
      "Generate hooks by style — question, pattern-interrupt, bold claim — tuned to what works for you.",
    href: "/hook-lab",
    icon: "Zap",
    category: "create",
    module: "B",
  },
  {
    id: "script-doctor",
    name: "Script Doctor",
    description:
      "Inline annotations for weak hooks, buried payoffs, and pacing — plus teleprompter mode.",
    href: "/caption-studio",
    icon: "FileText",
    category: "create",
    module: "B",
  },
  {
    id: "caption-studio",
    name: "Caption Studio",
    description:
      "Platform-aware captions with hashtag tiers, A/B pairs, and first-comment strategy.",
    href: "/caption-studio",
    icon: "Hash",
    category: "create",
    module: "B",
  },
  {
    id: "thumbnail-studio",
    name: "Thumbnail Studio",
    description:
      "Score and design thumbnails with feed simulator and platform safe-zone guides.",
    href: "/thumbnails",
    icon: "Image",
    category: "create",
    module: "B",
  },
  {
    id: "idea-generator",
    name: "Idea Generator",
    description:
      "Ideas with hook, outline, predicted score range, and trend linkage — one click to Script Doctor.",
    href: "/ideas",
    icon: "Lightbulb",
    category: "create",
    module: "B",
  },
  {
    id: "trend-radar",
    name: "Trend Radar",
    description:
      "Niche-scoped formats, sounds, and hashtags with lifecycle stages — emerging to declining.",
    href: "/trends",
    icon: "Radar",
    category: "intelligence",
    module: "C",
  },
  {
    id: "competitor-intel",
    name: "Competitor Intel",
    description:
      "Score their posts, learn why they worked, then create your angle — never clone.",
    href: "/competitors",
    icon: "Users",
    category: "intelligence",
    module: "C",
  },
  {
    id: "auto-dm",
    name: "DM Automation",
    description:
      "Comment-to-DM triggers via official Meta APIs — keywords, templates, conversion tracking.",
    href: "/messages",
    icon: "MessageCircle",
    category: "grow",
    module: "D",
  },
  {
    id: "biopage",
    name: "BioPage",
    description:
      "viralyz.com/@handle link-in-bio with analytics, tip jar, and Signal themes.",
    href: "/settings",
    icon: "Store",
    category: "publish",
    module: "E",
  },
];

export interface PlanDefinition {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  popular?: boolean;
  features: string[];
  limits: {
    analyses: number | "unlimited";
    platforms: number | "all";
    competitors: number;
    competitorSyncHours: number;
    dmAccounts: number;
    biopage: "basic" | "full" | "custom-domain";
    mediaKit: boolean | "white-label";
    teamSeats: number;
    api: boolean;
    marketplace: "none" | "apply" | "priority" | "post";
  };
}

/** v2.0 pricing — Free / Creator $29 / Studio $79 / Business $199 */
export const PLANS: PlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    currency: "USD",
    features: [
      "10 analyses / month",
      "1 platform",
      "3 competitors (24h refresh)",
      "Basic BioPage",
    ],
    limits: {
      analyses: 10,
      platforms: 1,
      competitors: 3,
      competitorSyncHours: 24,
      dmAccounts: 0,
      biopage: "basic",
      mediaKit: false,
      teamSeats: 1,
      api: false,
      marketplace: "none",
    },
  },
  {
    id: "creator",
    name: "Creator",
    priceMonthly: 29,
    priceYearly: 290,
    currency: "USD",
    popular: true,
    features: [
      "Unlimited analyses",
      "All platforms",
      "30 competitors (6h refresh)",
      "DM automation (1 account)",
      "Full BioPage + analytics",
      "Media Kit",
    ],
    limits: {
      analyses: "unlimited",
      platforms: "all",
      competitors: 30,
      competitorSyncHours: 6,
      dmAccounts: 1,
      biopage: "full",
      mediaKit: true,
      teamSeats: 1,
      api: false,
      marketplace: "apply",
    },
  },
  {
    id: "studio",
    name: "Studio",
    priceMonthly: 79,
    priceYearly: 790,
    currency: "USD",
    features: [
      "Everything in Creator",
      "100 competitors (1h refresh)",
      "DM automation (3 accounts)",
      "Custom domain BioPage",
      "White-label Media Kit",
      "5 team seats + API",
    ],
    limits: {
      analyses: "unlimited",
      platforms: "all",
      competitors: 100,
      competitorSyncHours: 1,
      dmAccounts: 3,
      biopage: "custom-domain",
      mediaKit: "white-label",
      teamSeats: 5,
      api: true,
      marketplace: "priority",
    },
  },
  {
    id: "business",
    name: "Business",
    priceMonthly: 199,
    priceYearly: 1990,
    currency: "USD",
    features: [
      "Everything in Studio",
      "DM automation (10 accounts)",
      "15 team seats",
      "Post marketplace campaigns",
    ],
    limits: {
      analyses: "unlimited",
      platforms: "all",
      competitors: 100,
      competitorSyncHours: 1,
      dmAccounts: 10,
      biopage: "full",
      mediaKit: true,
      teamSeats: 15,
      api: true,
      marketplace: "post",
    },
  },
];

export const APP_NAME = "Viralyz";
export const APP_TAGLINE = "See if content will work before you spend a penny on it.";
export const APP_DESCRIPTION =
  "Viralyz gives every video a score out of 100 and tells you exactly what to fix. Post better content, build a track record brands can trust, and get hired for it.";
export const APP_POSITIONING =
  "Creatify makes it. Collabstr sells it. Viralyz is how you know it will work.";

/** Production product host. Marketing CTAs always land here unless overridden. */
export const PUBLIC_APP_ORIGIN = "https://app.viralyz.com";

/**
 * Public CTA target for marketing → product (app.viralyz.com).
 *
 * - Default: `https://app.viralyz.com`
 * - Override with `NEXT_PUBLIC_APP_URL` (e.g. http://localhost:5000 for local)
 */
export function getPublicAppUrl(
  envUrl: string | undefined = process.env.NEXT_PUBLIC_APP_URL,
): string {
  const trimmed = envUrl?.trim();
  if (!trimmed) return PUBLIC_APP_ORIGIN;

  try {
    return new URL(trimmed).origin;
  } catch {
    if (trimmed.startsWith("/")) return PUBLIC_APP_ORIGIN;
    return PUBLIC_APP_ORIGIN;
  }
}

/** Join an app path onto the public product origin. */
export function getPublicAppPath(
  path: string,
  envUrl: string | undefined = process.env.NEXT_PUBLIC_APP_URL,
): string {
  const base = getPublicAppUrl(envUrl);
  if (!path || path === "/") return base;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** Sign-in entry on the product app. */
export function getPublicLoginUrl(
  envUrl: string | undefined = process.env.NEXT_PUBLIC_APP_URL,
): string {
  return getPublicAppPath("/api/login", envUrl);
}

export const CASE_STUDIES = [
  {
    handle: "@mayacreates",
    niche: "Creator education",
    result: "Hook score +28 pts in 3 weeks",
    quote:
      "I stopped guessing. Fix cards told me exactly what to change — and the re-score proved it.",
  },
  {
    handle: "@northbound",
    niche: "B2B SaaS",
    result: "2.1× retention on first 3s",
    quote:
      "Platform-tuned scoring for TikTok vs YouTube finally matched how we actually post.",
  },
  {
    handle: "@kitandco",
    niche: "Lifestyle",
    result: "Media kit closed first brand deal",
    quote:
      "Sending viralyz.com/kit/@us meant the brand saw verified metrics — not a PDF we made up.",
  },
] as const;
