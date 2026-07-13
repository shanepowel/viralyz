"use client";

import { cn } from "./lib/cn";

export interface StickyActionBarProps {
  children: React.ReactNode;
  className?: string;
}

/** Bottom sticky CTA row used on score results and similar flows. */
export function StickyActionBar({ children, className }: StickyActionBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 flex flex-wrap items-center justify-end gap-2.5 border-t border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--paper)_90%,transparent)] py-3.5 backdrop-blur-[10px]",
        className,
      )}
      data-testid="sticky-action-bar"
    >
      {children}
    </div>
  );
}
