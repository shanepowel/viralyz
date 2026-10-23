import {
  HaldenAd,
  PepaAd,
  RoveStoryAd,
} from "@/components/studio/ExampleAds";
import { PreflightDemoLarge } from "@/components/studio/PreflightDemo";
import { LockedReading } from "@/components/ui/LockedReading";
import { VariantCard } from "@/components/ui/VariantCard";
import { calibration, productFacts } from "@/lib/site";

/**
 * Drawn product illustrations for each platform step, shown inside a
 * DotPanel when the feature has no Sanity screenshot or demo video.
 * Every one uses fictional brands and needs the caption returned by
 * `showcaseCaption`.
 */
export function FeatureShowcase({ slug }: { slug: string }) {
  switch (slug) {
    case "pre-flight":
      return <PreflightDemoLarge />;
    case "discover":
      return (
        <div className="mx-auto flex w-full max-w-[720px] flex-wrap justify-center gap-3.5">
          {[
            { bg: "bg-[#2F5D50]", days: 41, src: "Meta Ad Library" },
            { bg: "bg-[#E8A33D]", days: 28, src: "TikTok library" },
            { bg: "bg-[#6B5BD6]", days: 63, src: "Meta Ad Library" },
          ].map((ad) => (
            <figure
              key={ad.days}
              className="m-0 flex min-w-[150px] flex-1 flex-col gap-2.5"
            >
              <div
                className={`relative aspect-[4/5] rounded-[18px] ${ad.bg}`}
                aria-hidden="true"
              >
                <span className="absolute bottom-3 left-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-black tabular">
                  {ad.days} days live
                </span>
              </div>
              <figcaption className="text-[13px] text-muted">{ad.src}</figcaption>
            </figure>
          ))}
        </div>
      );
    case "brand":
      return (
        <div className="mx-auto flex w-full max-w-[420px] flex-col gap-4 rounded-card border border-line bg-card p-[22px] shadow-float">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <strong className="font-semibold">Brand</strong>
            <span className="text-[13px] text-muted">halden.co</span>
          </div>
          <div className="flex gap-2" aria-hidden="true">
            <span className="h-12 flex-1 rounded-inner bg-[#1E3A2A]" />
            <span className="h-12 flex-1 rounded-inner bg-[#D5E5D8]" />
            <span className="h-12 flex-1 rounded-inner border border-line bg-[#F4F1EA]" />
            <span className="h-12 flex-1 rounded-inner bg-[#B5835A]" />
          </div>
          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[15px]">
            <li className="flex justify-between">
              <span>Logo</span>
              <span className="text-muted">Imported</span>
            </li>
            <li className="flex justify-between">
              <span>Colours</span>
              <span className="text-muted tabular">4</span>
            </li>
            <li className="flex justify-between">
              <span>Products</span>
              <span className="text-muted tabular">12</span>
            </li>
          </ul>
        </div>
      );
    case "studio":
      return (
        <div className="mx-auto grid w-full max-w-[720px] grid-cols-3 items-end gap-3.5">
          <VariantCard ratio="4:5" placement="Feed">
            <HaldenAd />
          </VariantCard>
          <VariantCard ratio="9:16" placement="Story">
            <RoveStoryAd />
          </VariantCard>
          <VariantCard ratio="1:1" placement="Square" generating>
            <PepaAd />
          </VariantCard>
        </div>
      );
    case "results":
      return (
        <LockedReading
          label="Pre-flight score vs CTR"
          matched={calibration.matched}
          threshold={productFacts.calibrationThreshold}
          value={calibration.rho}
          className="mx-auto w-full max-w-[520px] shadow-float"
        />
      );
    default:
      return null;
  }
}

export function showcaseCaption(slug: string) {
  if (slug === "results") return "Locked until your account has enough matched ads.";
  if (slug === "pre-flight") return "Illustrations use fictional brands.";
  return "Product UI shown with fictional brands.";
}
