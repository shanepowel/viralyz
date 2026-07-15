"use client";

import { cn } from "./lib/cn";

export type StatusChipTone =
  | "draft"
  | "scheduled"
  | "posted"
  | "tracking"
  | "neutral";

export interface StatusChipProps {
  children: React.ReactNode;
  tone?: StatusChipTone;
  className?: string;
}

const TONE: Record<StatusChipTone, string> = {
  draft: "bg-[var(--tint)] text-[var(--ink-3)]",
  scheduled: "bg-[var(--violet-soft)] text-[var(--violet-deep)]",
  posted: "bg-[var(--score-90-soft)] text-[var(--score-90)]",
  tracking: "bg-[var(--score-50-soft)] text-[var(--score-50)]",
  neutral: "bg-[var(--tint)] text-[var(--ink-2)]",
};

export function StatusChip({
  children,
  tone = "neutral",
  className,
}: StatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-[11px] py-1 text-[11px] font-semibold",
        TONE[tone],
        className,
      )}
      data-testid={`status-chip-${tone}`}
    >
      {children}
    </span>
  );
}
