import { getPublicAppPath } from "@repo/config";

export type NavLink = {
  href: string;
  ico: string;
  title: string;
  desc: string;
  /** Absolute URL to the product app (opens as <a>, not Next Link). */
  external?: boolean;
};

export type NavGroup = {
  id: "platform" | "creators" | "brands" | "resources";
  label: string;
  /** Hub page the top-level trigger navigates to. */
  href: string;
  columns: { heading: string; links: NavLink[] }[];
  feature?: {
    href: string;
    external?: boolean;
    title: string;
    desc: string;
    slotId: string;
    slotLabel: string;
  };
};

/** Shared mega-menu destinations used by desktop + mobile nav. */
export function getMarketingNavGroups(): NavGroup[] {
  return [
    {
      id: "platform",
      label: "Platform",
      href: "/platform",
      columns: [
        {
          heading: "Score & fix",
          links: [
            {
              href: getPublicAppPath("/analyze"),
              ico: "Sc",
              title: "Video scoring",
              desc: "Score out of 100 in 30 seconds",
              external: true,
            },
            {
              href: getPublicAppPath("/hook-lab"),
              ico: "Hk",
              title: "Hook tester",
              desc: "Ten opening lines, ranked",
              external: true,
            },
            {
              href: getPublicAppPath("/caption-studio"),
              ico: "Tp",
              title: "Teleprompter",
              desc: "Script feedback while you record",
              external: true,
            },
          ],
        },
        {
          heading: "Grow",
          links: [
            {
              href: getPublicAppPath("/thumbnails"),
              ico: "Th",
              title: "Thumbnail tests",
              desc: "Compare against your feed rivals",
              external: true,
            },
            {
              href: getPublicAppPath("/trends"),
              ico: "An",
              title: "Analytics",
              desc: "Track score trends over time",
              external: true,
            },
            {
              href: "/platform",
              ico: "Ap",
              title: "Integrations",
              desc: "TikTok, YouTube, Instagram, X",
            },
          ],
        },
      ],
      feature: {
        href: getPublicAppPath("/analyze"),
        external: true,
        title: "New: live score while recording",
        desc: "See your number before you even post",
        slotId: "mega-platform",
        slotLabel: "Product screenshot",
      },
    },
    {
      id: "creators",
      label: "For creators",
      href: "/for-creators",
      columns: [
        {
          heading: "Get discovered",
          links: [
            {
              href: "/for-creators#profile",
              ico: "Pr",
              title: "Verified profile",
              desc: "Real numbers, checked hourly",
            },
            {
              href: "/kit/mayacooks",
              ico: "Mk",
              title: "Media kit builder",
              desc: "One link brands can trust",
            },
            {
              href: "/tools/engagement-calculator",
              ico: "Rt",
              title: "Rate calculator",
              desc: "Suggested rates by niche",
            },
          ],
        },
        {
          heading: "Learn",
          links: [
            {
              href: "/blog",
              ico: "Ac",
              title: "Creator academy",
              desc: "Courses on scoring higher",
            },
            {
              href: "/for-creators#stories",
              ico: "St",
              title: "Success stories",
              desc: "Creators booked through Viralyz",
            },
            {
              href: "/affiliates",
              ico: "Cm",
              title: "Community",
              desc: "Swap notes with other creators",
            },
          ],
        },
      ],
    },
    {
      id: "brands",
      label: "For brands",
      href: "/for-brands",
      columns: [
        {
          heading: "Find talent",
          links: [
            {
              href: "/creators",
              ico: "Se",
              title: "Search creators",
              desc: "Filter by niche, score, platform",
            },
            {
              href: "/for-brands#campaigns",
              ico: "Cg",
              title: "Campaign manager",
              desc: "Brief, book, and pay in one place",
            },
            {
              href: "/report",
              ico: "Vd",
              title: "Verified data",
              desc: "No self-reported follower counts",
            },
          ],
        },
        {
          heading: "Proof",
          links: [
            {
              href: "/for-brands#cases",
              ico: "Cs",
              title: "Case studies",
              desc: "Real campaign results",
            },
            {
              href: "/pricing",
              ico: "Ag",
              title: "Agencies",
              desc: "Manage multiple client rosters",
            },
            {
              href: "/contact",
              ico: "Sl",
              title: "Talk to sales",
              desc: "Book a walkthrough for your team",
            },
          ],
        },
      ],
    },
    {
      id: "resources",
      label: "Resources",
      href: "/blog",
      columns: [
        {
          heading: "Learn",
          links: [
            {
              href: "/blog",
              ico: "Bl",
              title: "Blog",
              desc: "Scoring breakdowns & case studies",
            },
            {
              href: "/tools",
              ico: "To",
              title: "Free tools",
              desc: "Calculators and checkers, no signup",
            },
            {
              href: "/contact",
              ico: "He",
              title: "Help center",
              desc: "Guides and how-tos",
            },
          ],
        },
        {
          heading: "Build",
          links: [
            {
              href: "/platform",
              ico: "Ap",
              title: "API docs",
              desc: "Pull scores into your own tools",
            },
            {
              href: "/about",
              ico: "Ab",
              title: "About Viralyz",
              desc: "What we build and why",
            },
            {
              href: "/affiliates",
              ico: "Af",
              title: "Affiliates",
              desc: "Earn by sharing Viralyz",
            },
          ],
        },
      ],
    },
  ];
}

export type FooterColumn = {
  heading: string;
  links: { href: string; label: string; external?: boolean }[];
};

export function getMarketingFooterColumns(): FooterColumn[] {
  return [
    {
      heading: "Platform",
      links: [
        { href: getPublicAppPath("/analyze"), label: "Video scoring", external: true },
        { href: getPublicAppPath("/hook-lab"), label: "Hook tester", external: true },
        {
          href: getPublicAppPath("/caption-studio"),
          label: "Teleprompter",
          external: true,
        },
        {
          href: getPublicAppPath("/thumbnails"),
          label: "Thumbnail tests",
          external: true,
        },
        { href: "/platform", label: "Platform overview" },
      ],
    },
    {
      heading: "Creators",
      links: [
        { href: "/for-creators", label: "For creators" },
        { href: "/kit/mayacooks", label: "Sample media kit" },
        { href: "/tools/engagement-calculator", label: "Rate calculator" },
        { href: "/blog", label: "Academy" },
        { href: "/affiliates", label: "Community" },
      ],
    },
    {
      heading: "Brands",
      links: [
        { href: "/creators", label: "Search creators" },
        { href: "/for-brands#campaigns", label: "Campaign manager" },
        { href: "/for-brands#cases", label: "Case studies" },
        { href: "/pricing", label: "Agency plans" },
        { href: "/contact", label: "Talk to sales" },
      ],
    },
    {
      heading: "Resources",
      links: [
        { href: "/blog", label: "Blog" },
        { href: "/tools", label: "Free tools" },
        { href: "/report", label: "Viral Score Report" },
        { href: "/platform", label: "API docs" },
        { href: "/contact", label: "Help center" },
      ],
    },
    {
      heading: "Company",
      links: [
        { href: "/about", label: "About" },
        { href: "/affiliates", label: "Affiliates" },
        { href: "/contact", label: "Contact" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
        { href: "/cookies", label: "Cookies" },
      ],
    },
  ];
}
