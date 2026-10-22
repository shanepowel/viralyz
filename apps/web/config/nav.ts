import {
  BookOpen,
  ClipboardCheck,
  Info,
  LineChart,
  Newspaper,
  Palette,
  Search,
  ShieldCheck,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { routes } from "@/lib/site";

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
    label: "Product",
    href: routes.platform,
    groups: [
      {
        heading: "Make",
        links: [
          {
            label: "Discover",
            desc: "Long-running ads from official libraries",
            href: "/platform/discover",
            icon: Search,
          },
          {
            label: "Brand kit",
            desc: "Imported from your product page",
            href: "/platform/brand-kit",
            icon: Palette,
          },
          {
            label: "Studio",
            desc: "On-brand variants from a reference",
            href: "/platform/studio",
            icon: Wand2,
          },
        ],
      },
      {
        heading: "Check & learn",
        links: [
          {
            label: "Pre-flight checks",
            desc: "Spec and claim checks before you spend",
            href: "/platform/pre-flight",
            icon: ClipboardCheck,
          },
          {
            label: "Results & calibration",
            desc: "Your real CTR against our checks",
            href: "/platform/results",
            icon: LineChart,
          },
          {
            label: "How we measure",
            desc: "What every number means, and when it's blank",
            href: routes.trust,
            icon: ShieldCheck,
          },
        ],
      },
    ],
  },
  { label: "Pricing", href: routes.pricing },
  {
    label: "Resources",
    href: routes.blog,
    groups: [
      {
        heading: "Learn",
        links: [
          {
            label: "Blog",
            desc: "Notes on ad creative and measurement",
            href: routes.blog,
            icon: BookOpen,
          },
          {
            label: "Changelog",
            desc: "What shipped, and when",
            href: routes.changelog,
            icon: Newspaper,
          },
          {
            label: "About Viralyz",
            desc: "Who builds it and why",
            href: routes.about,
            icon: Info,
          },
        ],
      },
    ],
  },
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
      { label: "Pricing", href: routes.pricing },
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
} as const;
