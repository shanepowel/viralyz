"use client";

import { cn } from "./lib/cn";

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  delta?: { value: string; direction: "up" | "down" | "flat" };
  footnote?: React.ReactNode;
  sparkline?: number[];
  className?: string;
  /** Gradient NBA treatment */
  variant?: "default" | "nba";
  children?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  delta,
  footnote,
  sparkline,
  className,
  variant = "default",
  children,
}: StatCardProps) {
  const isNba = variant === "nba";
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--r-md)] border p-5",
        isNba
          ? "border-transparent bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] text-white"
          : "border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]",
        className,
      )}
      data-testid={isNba ? "stat-card-nba" : "stat-card"}
    >
      <div
        className={cn(
          "mb-2.5 flex items-center gap-1.5 text-[12px] font-medium",
          isNba ? "text-white/75" : "text-[var(--text-tertiary)]",
        )}
      >
        {label}
      </div>
      {children ?? (
        <div
          className={cn(
            "flex items-baseline gap-2.5 font-[family-name:var(--font-display)] text-[32px] font-bold leading-none",
            isNba ? "text-white" : "text-[var(--text-primary)]",
          )}
        >
          {value}
          {delta && (
            <span
              className={cn(
                "font-[family-name:var(--font-mono)] text-[11.5px] font-medium",
                delta.direction === "up" && "text-[var(--score-90)]",
                delta.direction === "down" && "text-[var(--score-30)]",
                delta.direction === "flat" && "text-[var(--text-tertiary)]",
                isNba && "text-white/90",
              )}
            >
              {delta.direction === "up" ? "▲ " : delta.direction === "down" ? "▼ " : ""}
              {delta.value}
            </span>
          )}
        </div>
      )}
      {footnote && (
        <div
          className={cn(
            "mt-2 text-[11.5px]",
            isNba ? "text-white/70" : "text-[var(--text-tertiary)]",
          )}
        >
          {footnote}
        </div>
      )}
      {sparkline && sparkline.length > 0 && !isNba && (
        <div
          className="absolute bottom-5 right-[18px] flex h-[26px] items-end gap-[3px]"
          aria-hidden
        >
          {sparkline.map((h, i) => (
            <i
              key={i}
              className={cn(
                "w-[5px] rounded-sm",
                i === sparkline.length - 1
                  ? "bg-[var(--accent)]"
                  : "bg-[var(--accent-muted)]",
              )}
              style={{ height: `${Math.max(4, h)}px` }}
            />
          ))}
        </div>
      )}
      {isNba && (
        <div
          className="pointer-events-none absolute -right-[22px] -top-[22px] h-[110px] w-[110px] rounded-full border-[18px] border-white/10"
          aria-hidden
        />
      )}
    </div>
  );
}
