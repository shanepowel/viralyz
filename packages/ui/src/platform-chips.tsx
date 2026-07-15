"use client";

import { cn } from "./lib/cn";

export type Platform = "tiktok" | "youtube" | "instagram" | "x";

export interface PlatformChipsProps {
  value: Platform | Platform[];
  onChange: (platform: Platform) => void;
  multiple?: boolean;
  className?: string;
}

const PLATFORMS: {
  id: Platform;
  label: string;
  color: string;
}[] = [
  { id: "tiktok", label: "TikTok", color: "rgba(0, 242, 234, 0.16)" },
  { id: "youtube", label: "YouTube", color: "rgba(255, 0, 0, 0.16)" },
  { id: "instagram", label: "Instagram", color: "rgba(225, 48, 108, 0.16)" },
  { id: "x", label: "X", color: "rgba(255, 255, 255, 0.12)" },
];

export function PlatformChips({
  value,
  onChange,
  multiple = false,
  className,
}: PlatformChipsProps) {
  const selected = Array.isArray(value) ? value : [value];

  return (
    <div
      className={cn("inline-flex flex-wrap gap-2", className)}
      role="group"
      aria-label="Platform"
    >
      {PLATFORMS.map((p) => {
        const isOn = selected.includes(p.id);
        return (
          <button
            key={p.id}
            type="button"
            aria-pressed={isOn}
            onClick={() => onChange(p.id)}
            className={cn(
              "inline-flex h-9 items-center rounded-[var(--r-full)] border px-3.5 text-[13px] font-medium transition-colors duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
              isOn
                ? "border-transparent text-[var(--text-primary)]"
                : "border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]",
            )}
            style={isOn ? { backgroundColor: p.color } : undefined}
          >
            {p.label}
            {multiple && isOn ? " ✓" : ""}
          </button>
        );
      })}
    </div>
  );
}
