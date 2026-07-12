export const MARKETING_STATS = [
  { value: "10K+", label: "Creators" },
  { value: "2M+", label: "Videos analyzed" },
  { value: "<30s", label: "Avg. analysis time" },
  { value: "4.2×", label: "Avg. view lift" },
] as const;

export const MARKETING_EYEBROW = "Grammarly for Viral Content";

export const MARKETING_HERO = {
  headline: "Know Your Content Will Go Viral",
  headlineAccent: "Before You Post It",
  subhead:
    "Like Grammarly checks your writing, Viralyz checks your content. Get a Viral Score (0–100), see exactly what to fix, and post with confidence.",
  primaryCta: "Analyze Your First Video Free",
  secondaryCta: "Watch Demo",
  trustLine: "No credit card required · 10 free analyses",
  socialProof: "Trusted by 10,000+ creators",
};

export const MARKETING_PLATFORMS = [
  "YouTube",
  "TikTok",
  "Instagram",
  "Twitter",
] as const;

export const MARKETING_STEPS = [
  {
    emoji: "📁",
    step: "Step 1",
    title: "Upload Your Content",
    description:
      "Drop your video, image, or paste a link. We support all major platforms.",
  },
  {
    emoji: "📊",
    step: "Step 2",
    title: "Get Your Score",
    description:
      "Our AI analyzes hook, visuals, structure, metadata, and timing in seconds.",
  },
  {
    emoji: "🚀",
    step: "Step 3",
    title: "Fix & Post",
    description:
      "Apply our suggestions, watch your score rise, then post with confidence.",
  },
] as const;

export const MARKETING_FEATURES = [
  {
    title: "Viral Score",
    description:
      "Score every post 0–100 across hook, visuals, structure, metadata, timing.",
    icon: "Target",
    href: "/analyze",
  },
  {
    title: "Hook Lab",
    description:
      "Generate 10 scroll-stopping hook variants. AI scores them. Pick the winner.",
    icon: "Zap",
    href: "/hook-lab",
  },
  {
    title: "Caption Studio",
    description:
      "Paste your caption. AI rewrites for virality with hashtags & tone variants.",
    icon: "FileText",
    href: "/caption-studio",
  },
  {
    title: "Idea Generator",
    description:
      "Stop staring at a blank page. 8 fresh ideas with hooks, outlines, and scores.",
    icon: "Lightbulb",
    href: "/ideas",
  },
  {
    title: "Trend Radar",
    description:
      "What's hot in your niche right now — formats, topics, debates, hashtags.",
    icon: "Radar",
    href: "/trends",
  },
  {
    title: "Competitor Intel",
    description:
      "Track what's working in your niche. Reverse-engineer the winners.",
    icon: "Users",
    href: "/intelligence",
  },
] as const;

export const MARKETING_RESULTS = {
  before: {
    score: 34,
    views: "2.3K views",
    issues: [
      "Weak hook — viewers drop off at 2 seconds",
      "Thumbnail text too small",
      "Posted at wrong time",
    ],
  },
  after: {
    score: 89,
    views: "847K views",
    improvements: [
      "Strong hook with pattern interrupt",
      "Optimized thumbnail with clear text",
      "Posted at peak engagement time",
    ],
    multiplier: "↑ 368× improvement",
  },
};

export const MARKETING_TESTIMONIALS = [
  {
    quote:
      "Viralyz helped me go from 10K to 500K views per video. The hook analysis alone is worth 10× the price.",
    initials: "SC",
    name: "Sarah Chen",
    handle: "@sarahcreates · 500K avg views",
  },
  {
    quote:
      "I stopped posting blindly. Now I know exactly what to fix before I hit publish. Game changer.",
    initials: "MJ",
    name: "Marcus Johnson",
    handle: "@marcusj · 2.3M followers",
  },
  {
    quote:
      "The competitor intelligence feature showed me what was working in my niche. My engagement 4×'d.",
    initials: "ER",
    name: "Emily Rodriguez",
    handle: "@emilycooks · 4× engagement",
  },
] as const;

export interface MarketingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

export const MARKETING_PLANS: MarketingPlan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    description: "Perfect for getting started",
    features: [
      "10 analyses per month",
      "1 platform",
      "Basic viral score",
      "Standard support",
    ],
    cta: "Start Free",
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 29,
    description: "For serious creators",
    popular: true,
    features: [
      "Unlimited analyses",
      "All platforms",
      "Full AI suggestions",
      "Performance tracking",
      "Priority support",
    ],
    cta: "Go Pro",
  },
  {
    id: "team",
    name: "Team",
    priceMonthly: 99,
    description: "For agencies & teams",
    features: [
      "Everything in Pro",
      "5 team members",
      "Competitor tracking",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact Us",
  },
];

export const MARKETING_COMPARISON = [
  {
    feature: "Pre-publish viral score",
    viralyz: true,
    opus: true,
    vidiq: false,
    tubebuddy: false,
  },
  {
    feature: "Hook + caption optimization",
    viralyz: true,
    opus: true,
    vidiq: true,
    tubebuddy: false,
  },
  {
    feature: "Competitor intelligence",
    viralyz: true,
    opus: false,
    vidiq: true,
    tubebuddy: true,
  },
  {
    feature: "Best time to post heatmap",
    viralyz: true,
    opus: false,
    vidiq: true,
    tubebuddy: false,
  },
  {
    feature: "Multi-platform repurpose",
    viralyz: true,
    opus: true,
    vidiq: false,
    tubebuddy: false,
  },
  {
    feature: "Prediction vs actual tracking",
    viralyz: true,
    opus: false,
    vidiq: false,
    tubebuddy: false,
  },
] as const;

export const MARKETING_FAQ = [
  {
    question: "How accurate is the Viral Score?",
    answer:
      "Our AI is trained on millions of viral posts across TikTok, YouTube, and Instagram. Scores correlate strongly with actual performance — most creators see 2–5× view improvements after applying suggestions.",
  },
  {
    question: "What platforms do you support?",
    answer:
      "TikTok, YouTube Shorts, Instagram Reels, and Twitter/X video. Upload directly or paste a link from any supported platform.",
  },
  {
    question: "How long does analysis take?",
    answer:
      "Most analyses complete in under 30 seconds. You'll get your full Viral Score breakdown with actionable fixes immediately.",
  },
  {
    question: "Can I re-analyze after making changes?",
    answer:
      "Yes — iterate until you're happy. Re-upload your revised content and watch your score climb before you post.",
  },
  {
    question: "Do you post content for me?",
    answer:
      "No. Viralyz analyzes and optimizes your content before you publish. You stay in control of what goes live.",
  },
] as const;
