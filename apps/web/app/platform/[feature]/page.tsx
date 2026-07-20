import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { features, getFeature } from "@/data/features";
import { pageMeta } from "@/lib/meta";

type Params = Promise<{ feature: string }>;

export function generateStaticParams() {
  return features.map((f) => ({ feature: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { feature } = await params;
  const f = getFeature(feature);
  if (!f) return {};
  return pageMeta({
    title: f.name,
    description: f.tagline,
    path: `/platform/${f.slug}`,
  });
}

export default async function FeaturePage({ params }: { params: Params }) {
  const { feature } = await params;
  const f = getFeature(feature);
  if (!f) notFound();

  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <p className="crumb">
            <Link href="/platform">Platform</Link> / {f.name}
          </p>
          <span className="eyebrow">Platform</span>
          <h1>{f.name}</h1>
          <p>{f.tagline}</p>
        </div>
      </div>

      <section style={{ paddingTop: 8, paddingBottom: 48 }}>
        <div className="wrap about-body">
          <p>{f.description}</p>
          <ul style={{ margin: "24px 0", paddingLeft: 20 }}>
            {f.bullets.map((b) => (
              <li key={b} style={{ marginBottom: 8 }}>
                {b}
              </li>
            ))}
          </ul>
          <a href={f.appHref} className="btn btn-primary">
            Try {f.name} free
          </a>
          <p className="fine" style={{ marginTop: 12 }}>
            10 free scores a month. No card required.
          </p>
        </div>
      </section>

      <FinalCta
        title={`Try ${f.name} free`}
        subtitle="Ten free scores a month. No card required."
        cta={`Open ${f.name}`}
        href={f.appHref}
      />
    </MarketingShell>
  );
}
