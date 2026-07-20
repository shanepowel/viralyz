import { routes, APP_URL } from "@/lib/site";
import { flags } from "@/lib/flags";

export type NavLink = {
  label: string;
  desc?: string;
  href: string;
  external?: boolean;
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
          },
          {
            label: "Hook Lab",
            desc: "Ten opening lines, ranked",
            href: "/platform/hook-lab",
          },
          {
            label: "Script Doctor",
            desc: "Line-by-line script feedback",
            href: "/platform/script-doctor",
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
          },
          {
            label: "Performance Tracking",
            desc: "Predicted vs actual, over time",
            href: "/platform/performance-tracking",
          },
          {
            label: "Integrations",
            desc: "TikTok, YouTube, Instagram, X",
            href: `${routes.platform}#integrations`,
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
          },
          {
            label: "Media kit",
            desc: "One link brands can trust",
            href: `${routes.forCreators}#media-kit`,
          },
          {
            label: "Rate calculator",
            desc: "Suggested rates by niche",
            href: "/tools/engagement-calculator",
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
          },
          {
            label: "How campaigns work",
            desc: "Brief, book, and pay in one place",
            href: `${routes.forBrands}#campaigns`,
          },
          {
            label: "Talk to sales",
            desc: "Book a walkthrough for your team",
            href: routes.contact,
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
          },
          {
            label: "Free tools",
            desc: "Calculators and checkers, no signup",
            href: routes.tools,
          },
          {
            label: "About Viralyz",
            desc: "What we build and why",
            href: routes.about,
          },
          ...(flags.helpCenterLive
            ? [
                {
                  label: "Help center",
                  desc: "Guides and how-tos",
                  href: "/help",
                } satisfies NavLink,
              ]
            : []),
          ...(flags.apiDocsLive
            ? [
                {
                  label: "API docs",
                  desc: "Pull scores into your tools",
                  href: "/docs/api",
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
