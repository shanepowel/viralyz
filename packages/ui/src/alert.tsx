import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./lib/cn";

const alertVariants = cva("w-full rounded-md border px-4 py-3 text-sm", {
  variants: {
    tone: {
      neutral: "border-line bg-raised text-ink",
      info: "border-transparent bg-accent-soft text-ink",
      success: "border-transparent bg-score-high-soft text-ink",
      warning: "border-transparent bg-score-mid-soft text-ink",
      danger: "border-transparent bg-score-low-soft text-ink",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof alertVariants> {
  title?: ReactNode;
}

export function Alert({
  className,
  tone = "neutral",
  title,
  children,
  ...props
}: AlertProps) {
  const assertive = tone === "danger" || tone === "warning";
  return (
    <div
      role={assertive ? "alert" : "status"}
      className={cn(alertVariants({ tone }), className)}
      {...props}
    >
      {title ? <p className="font-medium text-ink">{title}</p> : null}
      {children ? (
        <div className={cn("text-ink-secondary", title && "mt-1")}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

export { alertVariants };
