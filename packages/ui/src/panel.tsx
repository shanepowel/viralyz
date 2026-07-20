"use client";

import { cn } from "./lib/cn";

export interface PanelProps {
  children: React.ReactNode;
  className?: string;
  /** Optional header row */
  title?: React.ReactNode;
  action?: React.ReactNode;
  padded?: boolean;
}

export function Panel({
  children,
  className,
  title,
  action,
  padded = false,
}: PanelProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]",
        className,
      )}
      data-testid="panel"
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-5 py-4">
          {typeof title === "string" ? (
            <h3 className="font-[family-name:var(--font-display)] text-[15px] font-semibold text-[var(--text-primary)]">
              {title}
            </h3>
          ) : (
            title
          )}
          {action}
        </header>
      )}
      <div className={cn(padded && "p-5")}>{children}</div>
    </section>
  );
}
