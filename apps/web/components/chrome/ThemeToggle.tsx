"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-sm text-ink-secondary",
          className,
        )}
        aria-label="Change theme"
      >
        <Sun className="h-4 w-4" />
      </button>
    );
  }

  const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[2];
  const Icon = current.icon;

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-ink-secondary hover:bg-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Change theme"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon className="h-4 w-4" />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 min-w-36 rounded-md border border-line bg-raised p-1 shadow-md"
        >
          {OPTIONS.map((opt) => {
            const OptIcon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitem"
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-sm text-ink-secondary hover:bg-sunken hover:text-ink",
                  theme === opt.value && "bg-sunken text-ink",
                )}
                onClick={() => {
                  setTheme(opt.value);
                  setOpen(false);
                }}
              >
                <OptIcon className="h-4 w-4" />
                {opt.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
