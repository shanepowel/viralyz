import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * A pricing card. `highlight` switches to the inverse style — a visual
 * emphasis only, never a "most popular" claim.
 */
export function PricingCard({
  name,
  price,
  meta,
  description,
  cta,
  highlight = false,
  className,
}: {
  name: string;
  price: React.ReactNode;
  meta?: React.ReactNode;
  description: React.ReactNode;
  cta: { label: string; href: string };
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 rounded-3xl p-7",
        highlight
          ? "bg-inv text-inv-ink"
          : "border border-line bg-card text-ink",
        className,
      )}
    >
      <h3 className="m-0 text-[17px] font-semibold">{name}</h3>
      <div>
        <p className="m-0 font-display tabular text-[52px]">{price}</p>
        {meta ? (
          <p
            className={cn(
              "m-0 mt-1.5 text-sm tabular",
              highlight ? "text-inv-muted" : "text-muted",
            )}
          >
            {meta}
          </p>
        ) : null}
      </div>
      <p
        className={cn(
          "m-0 text-[15px]",
          highlight ? "text-inv-muted" : "text-muted",
        )}
      >
        {description}
      </p>
      <ButtonLink
        href={cta.href}
        variant={highlight ? "inverse" : "secondary"}
        className={cn("mt-auto min-h-12", !highlight && "bg-card")}
      >
        {cta.label}
      </ButtonLink>
    </div>
  );
}
