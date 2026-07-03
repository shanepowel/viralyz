export type ToolId =
  | "virality-predictor"
  | "script-enhancer"
  | "competitor-tracker"
  | "video-analysis"
  | "profile-analysis"
  | "seo-caption"
  | "thumbnail-generator"
  | "content-planner"
  | "auto-dm"
  | "bio-store";

export interface ToolDefinition {
  id: ToolId;
  name: string;
  description: string;
  href: string;
  icon: string;
  category: "create" | "analyze" | "grow" | "monetize";
}

export const TOOLS: ToolDefinition[] = [
  {
    id: "virality-predictor",
    name: "Virality Predictor",
    description: "Score content ideas before you publish with AI-powered virality analysis.",
    href: "/dashboard/tools/virality-predictor",
    icon: "TrendingUp",
    category: "analyze",
  },
  {
    id: "script-enhancer",
    name: "Script Enhancer",
    description: "Transform rough ideas into engaging short-form scripts that retain viewers.",
    href: "/dashboard/tools/script-enhancer",
    icon: "FileText",
    category: "create",
  },
  {
    id: "competitor-tracker",
    name: "Competitor Tracker",
    description: "Monitor competitor performance and spot winning content patterns.",
    href: "/dashboard/tools/competitor-tracker",
    icon: "Users",
    category: "analyze",
  },
  {
    id: "video-analysis",
    name: "Video Analysis",
    description: "Get AI feedback on hooks, pacing, and structure for every upload.",
    href: "/dashboard/tools/video-analysis",
    icon: "Video",
    category: "analyze",
  },
  {
    id: "profile-analysis",
    name: "Profile Analysis",
    description: "Audit your social profile and get actionable growth recommendations.",
    href: "/dashboard/tools/profile-analysis",
    icon: "UserCircle",
    category: "analyze",
  },
  {
    id: "seo-caption",
    name: "SEO / Caption Generator",
    description: "Generate platform-optimized captions and hashtags that get discovered.",
    href: "/dashboard/tools/seo-caption",
    icon: "Hash",
    category: "create",
  },
  {
    id: "thumbnail-generator",
    name: "Thumbnail Generator",
    description: "Create eye-catching thumbnails aligned with your brand aesthetic.",
    href: "/dashboard/tools/thumbnail-generator",
    icon: "Image",
    category: "create",
  },
  {
    id: "content-planner",
    name: "Content Planner",
    description: "Plan your content calendar with trending ideas in your niche.",
    href: "/dashboard/tools/content-planner",
    icon: "Calendar",
    category: "create",
  },
  {
    id: "auto-dm",
    name: "Instagram Auto DM",
    description: "Automate personalized DMs to nurture leads and boost conversions.",
    href: "/dashboard/tools/auto-dm",
    icon: "MessageCircle",
    category: "grow",
  },
  {
    id: "bio-store",
    name: "BioStore",
    description: "Build a link-in-bio storefront with built-in analytics.",
    href: "/dashboard/tools/bio-store",
    icon: "Store",
    category: "monetize",
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
    projects: number;
    scriptEnhancer: number;
    videoAnalysis: number;
    seoGenerator: number;
    thumbnails: number;
    captions: number;
    contentPlanner: number;
    competitors: number;
    competitorSyncHours: number;
    profileSyncHours: number;
    autoDmComments: number | "unlimited";
  };
}

export const PLANS: PlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    currency: "USD",
    features: [
      "1 Project",
      "1,000 Auto DM comments",
      "BioStore included",
      "Weekly Content Planner",
    ],
    limits: {
      projects: 1,
      scriptEnhancer: 12,
      videoAnalysis: 12,
      seoGenerator: 12,
      thumbnails: 3,
      captions: 12,
      contentPlanner: 12,
      competitors: 5,
      competitorSyncHours: 24,
      profileSyncHours: 24,
      autoDmComments: 1000,
    },
  },
  {
    id: "lite",
    name: "Lite",
    priceMonthly: 19,
    priceYearly: 114,
    currency: "USD",
    features: [
      "1 Project",
      "Unlimited Auto DMs",
      "BioStore included",
      "Weekly Content Planner",
    ],
    limits: {
      projects: 1,
      scriptEnhancer: 25,
      videoAnalysis: 25,
      seoGenerator: 25,
      thumbnails: 10,
      captions: 25,
      contentPlanner: 25,
      competitors: 15,
      competitorSyncHours: 24,
      profileSyncHours: 24,
      autoDmComments: "unlimited",
    },
  },
  {
    id: "creator-growth",
    name: "Creator Growth",
    priceMonthly: 29,
    priceYearly: 174,
    currency: "USD",
    popular: true,
    features: [
      "1 Project",
      "Unlimited Auto DMs",
      "BioStore included",
      "Weekly Content Planner",
      "12-hour competitor sync",
    ],
    limits: {
      projects: 1,
      scriptEnhancer: 50,
      videoAnalysis: 50,
      seoGenerator: 50,
      thumbnails: 20,
      captions: 50,
      contentPlanner: 50,
      competitors: 30,
      competitorSyncHours: 12,
      profileSyncHours: 12,
      autoDmComments: "unlimited",
    },
  },
  {
    id: "creator-pro",
    name: "Creator Pro",
    priceMonthly: 49,
    priceYearly: 294,
    currency: "USD",
    features: [
      "5 Projects",
      "Unlimited Auto DMs",
      "BioStore included",
      "Weekly Content Planner",
      "5-hour competitor sync",
    ],
    limits: {
      projects: 5,
      scriptEnhancer: 150,
      videoAnalysis: 150,
      seoGenerator: 150,
      thumbnails: 40,
      captions: 150,
      contentPlanner: 150,
      competitors: 80,
      competitorSyncHours: 5,
      profileSyncHours: 5,
      autoDmComments: "unlimited",
    },
  },
];

export const APP_NAME = "Viralyz";
export const APP_TAGLINE = "Grammarly for Viral Content";
export const APP_DESCRIPTION =
  "Know your content will go viral before you post it. AI-powered content analysis with Viral Scores.";

export * from "./marketing";
