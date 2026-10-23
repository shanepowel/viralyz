import { SanityImage, type SanityImageValue } from "@/components/media/SanityImage";
import { CheckChip, type CheckState } from "@/components/ui/CheckChip";
import { cn } from "@/lib/cn";

export type AdRatio = "1:1" | "4:5" | "9:16";

const ASPECT: Record<AdRatio, string> = {
  "1:1": "aspect-square",
  "4:5": "aspect-[4/5]",
  "9:16": "aspect-[9/16]",
};

const HEIGHT_PER_400: Record<AdRatio, number> = {
  "1:1": 400,
  "4:5": 500,
  "9:16": 711,
};

/**
 * An ad at its true aspect ratio with its placement and pre-flight verdict.
 * Pass a Sanity `image` for real output; `children` (a drawn placeholder)
 * renders only when there is no image.
 */
export function VariantCard({
  ratio,
  placement,
  check,
  image,
  generating = false,
  children,
  className,
}: {
  ratio: AdRatio;
  placement: string;
  check?: { state: CheckState; label?: string; value?: string };
  image?: SanityImageValue | null;
  /** While generating, the card shimmers and the chip waits for every check. */
  generating?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("m-0 flex flex-col gap-2.5", className)}>
      <div
        className={cn(
          "@container relative overflow-hidden rounded-[18px]",
          ASPECT[ratio],
          generating && "vz-shimmer bg-panel",
        )}
      >
        {generating ? null : image?.asset ? (
          <SanityImage
            value={image}
            width={400}
            height={HEIGHT_PER_400[ratio]}
            sizes="(max-width: 768px) 50vw, 20vw"
            className="h-full w-full [&_img]:h-full"
          />
        ) : (
          children
        )}
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 text-[13px]">
        <span className="text-muted">
          {placement} · {ratio}
        </span>
        {check && !generating ? (
          <CheckChip
            state={check.state}
            label={check.label}
            value={check.value}
            size="md"
            className="font-semibold"
          />
        ) : null}
      </figcaption>
    </figure>
  );
}
