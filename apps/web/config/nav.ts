import { routes } from "@/lib/site";
import { features } from "@/data/features";

export type NavLink = {
  label: string;
  href: string;
};

/** The five links in the centre of the site nav. */
export const mainNav: NavLink[] = [
  { label: "Platform", href: routes.platform },
  { label: "For sellers", href: routes.forBrands },
  { label: "Pricing", href: routes.pricing },
  { label: "Trust", href: routes.trust },
  { label: "Free tools", href: routes.tools },
];

export type FooterColumn = {
  heading: string;
  links: NavLink[];
};

export const footerColumns: FooterColumn[] = [
  {
    heading: "Platform",
    links: [
      { label: "Overview", href: routes.platform },
      ...features.map((f) => ({ label: f.name, href: `/platform/${f.slug}` })),
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: routes.about },
      { label: "For sellers", href: routes.forBrands },
      { label: "Trust", href: routes.trust },
      { label: "Blog", href: routes.blog },
      { label: "Free tools", href: routes.tools },
      { label: "Pricing", href: routes.pricing },
      { label: "Changelog", href: routes.changelog },
      { label: "Contact", href: routes.contact },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms", href: routes.terms },
      { label: "Privacy", href: routes.privacy },
      { label: "Cookies", href: routes.cookies },
    ],
  },
];

export const chromeLinks = {
  signIn: routes.login,
  startFree: routes.signup,
} as const;
