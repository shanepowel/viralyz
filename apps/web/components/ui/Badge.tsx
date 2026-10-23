import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Num } from "@/components/ui/Num";

const badge = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-panel text-muted",
        accent: "bg-panel text-ink",
        demo: "bg-panel text-ink",
        score: "",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

/** Scores are not check results, so they stay neutral; use CheckChip for verdicts. */
function scoreTone() {
  return "border border-line text-muted";
}

type Props = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badge> & {
    score?: number;
    label?: string;
  };

export function Badge({
  className,
  variant = "neutral",
  score,
  label,
  children,
  ...props
}: Props) {
  if (variant === "score" && typeof score === "number") {
    return (
      <span className={cn(badge({ variant }), scoreTone(), className)} {...props}>
        <Num>{score}</Num>
        {label ? <span>{label}</span> : null}
      </span>
    );
  }

  return (
    <span className={cn(badge({ variant }), className)} {...props}>
      {children ?? (variant === "demo" ? label ?? "Example profile" : null)}
    </span>
  );
}

/** @deprecated Prefer Badge variant="demo" */
export function DemoBadge({ label = "Example profile" }: { label?: string }) {
  return <Badge variant="demo">{label}</Badge>;
}
