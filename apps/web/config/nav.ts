import {
  Activity,
  BookOpen,
  Calculator,
  Clapperboard,
  Gauge,
  ImageIcon,
  Info,
  LineChart,
  Plug,
  Search,
  Sparkles,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { routes, APP_URL } from "@/lib/site";
import { flags } from "@/lib/flags";

export type NavLink = {
  label: string;
  desc?: string;
  href: string;
  external?: boolean;
  icon?: LucideIcon;
};
export type NavGroup = { heading: string; links: NavLink[] };
export type NavSection = {
  label: string;
  href: string;
  groups?: NavGroup[];
};

export const mainNav: NavSection[] = [
  {
    label: "Platform",
    href: routes.platform,
    groups: [
      {
        heading: "Score & fix",
        links: [
          {
            label: "Viral Score",
            desc: "Score out of 100 in 30 seconds",
            href: "/platform/viral-score",
            icon: Gauge,
          },
          {
            label: "Hook Lab",
            desc: "Ten opening lines, ranked",
            href: "/platform/hook-lab",
            icon: Sparkles,
          },
          {
            label: "Script Doctor",
            desc: "Line-by-line script feedback",
            href: "/platform/script-doctor",
            icon: Clapperboard,
          },
        ],
      },
      {
        heading: "Grow",
        links: [
          {
            label: "Thumbnail Studio",
            desc: "Compare at real feed size",
            href: "/platform/thumbnail-studio",
            icon: ImageIcon,
          },
          {
            label: "Performance Tracking",
            desc: "Predicted vs actual, over time",
            href: "/platform/performance-tracking",
            icon: LineChart,
          },
          {
            label: "Integrations",
            desc: "TikTok, YouTube, Instagram, X",
            href: `${routes.platform}#integrations`,
            icon: Plug,
          },
        ],
      },
    ],
  },
  {
    label: "For creators",
    href: routes.forCreators,
    groups: [
      {
        heading: "Get discovered",
        links: [
          {
            label: "Verified profile",
            desc: "Real numbers from connected accounts",
            href: `${routes.forCreators}#profile`,
            icon: UserRound,
          },
          {
            label: "Media kit",
            desc: "One link brands can trust",
            href: `${routes.forCreators}#media-kit`,
            icon: BookOpen,
          },
          {
            label: "Rate calculator",
            desc: "Suggested rates by niche",
            href: "/tools/engagement-calculator",
            icon: Calculator,
          },
        ],
      },
    ],
  },
  {
    label: "For brands",
    href: routes.forBrands,
    groups: [
      {
        heading: "Find talent",
        links: [
          {
            label: "Browse creators",
            desc: "Filter by niche, score, platform",
            href: routes.creators,
            icon: Search,
          },
          {
            label: "How campaigns work",
            desc: "Brief, book, and pay in one place",
            href: `${routes.forBrands}#campaigns`,
            icon: Activity,
          },
          {
            label: "Talk to sales",
            desc: "Book a walkthrough for your team",
            href: routes.contact,
            icon: Info,
          },
        ],
      },
    ],
  },
  {
    label: "Resources",
    href: routes.blog,
    groups: [
      {
        heading: "Learn",
        links: [
          {
            label: "Blog",
            desc: "Teardowns and honest pricing data",
            href: routes.blog,
            icon: BookOpen,
          },
          {
            label: "Free tools",
            desc: "Calculators and checkers, no signup",
            href: routes.tools,
            icon: Wrench,
          },
          {
            label: "About Viralyz",
            desc: "What we build and why",
            href: routes.about,
            icon: Info,
          },
          ...(flags.helpCenterLive
            ? [
                {
                  label: "Help center",
                  desc: "Guides and how-tos",
                  href: "/help",
                  icon: Info,
                } satisfies NavLink,
              ]
            : []),
          ...(flags.apiDocsLive
            ? [
                {
                  label: "API docs",
                  desc: "Pull scores into your tools",
                  href: "/docs/api",
                  icon: Plug,
                } satisfies NavLink,
              ]
            : []),
        ],
      },
    ],
  },
  { label: "Pricing", href: routes.pricing },
];

export type FooterColumn = {
  heading: string;
  links: NavLink[];
};

export const footerExtras: FooterColumn[] = [
  {
    heading: "Company",
    links: [
      { label: "About", href: routes.about },
      { label: "Trust & data", href: routes.trust },
      { label: "Changelog", href: routes.changelog },
      { label: "Affiliates", href: routes.affiliates },
      { label: "Contact", href: routes.contact },
      { label: "Privacy", href: routes.privacy },
      { label: "Terms", href: routes.terms },
      { label: "Cookies", href: routes.cookies },
    ],
  },
];

export function getFooterColumns(): FooterColumn[] {
  const fromNav: FooterColumn[] = mainNav
    .filter((s) => s.groups?.length)
    .map((section) => ({
      heading: section.label,
      links: [
        { label: `${section.label} overview`, href: section.href },
        ...(section.groups?.flatMap((g) => g.links) ?? []),
      ],
    }));

  return [...fromNav, ...footerExtras];
}

export const chromeLinks = {
  signIn: routes.login,
  startFree: routes.signup,
  scoreVideo: APP_URL,
} as const;
