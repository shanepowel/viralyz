import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href
        ? { item: item.href.startsWith("http") ? item.href : `${SITE_URL}${item.href}` }
        : {}),
    })),
  };

  return (
    <>
      <JsonLd data={data} />
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-tertiary">
          {items.map((item, i) => (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 ? <span aria-hidden>/</span> : null}
              {item.href && i < items.length - 1 ? (
                <Link href={item.href} className="hover:text-ink transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-ink-secondary">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
