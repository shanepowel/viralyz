import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/lib/cn";

type SanityImageValue = {
  asset?: {
    _id?: string;
    url?: string;
    metadata?: {
      lqip?: string;
      dimensions?: { width?: number; height?: number };
    };
  };
  alt?: string;
  caption?: string;
  hotspot?: unknown;
  crop?: unknown;
};

export function SanityImage({
  value,
  width = 1200,
  height,
  className,
  priority = false,
  sizes,
  alt,
}: {
  value: SanityImageValue | null | undefined;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  alt?: string;
}) {
  if (!value?.asset) return null;
  const dims = value.asset.metadata?.dimensions;
  const aspect =
    dims?.width && dims?.height ? dims.width / dims.height : 16 / 9;
  const h = height ?? Math.round(width / aspect);
  const resolvedAlt = alt ?? value.alt ?? "";

  return (
    <figure className={cn(className)}>
      <Image
        src={urlFor(value).width(width).height(h).fit("crop").url()}
        alt={resolvedAlt}
        width={width}
        height={h}
        className="h-auto w-full object-cover"
        priority={priority}
        sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
        placeholder={value.asset.metadata?.lqip ? "blur" : "empty"}
        blurDataURL={value.asset.metadata?.lqip}
      />
      {value.caption ? (
        <figcaption className="mt-2 text-sm text-ink-tertiary">
          {value.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
