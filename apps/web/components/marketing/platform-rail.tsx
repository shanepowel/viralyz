"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export function PlatformRail({ groups }: { groups: string[] }) {
  const [active, setActive] = useState(groups[0] ?? "");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    for (const g of groups) {
      const el = document.getElementById(`group-${g.toLowerCase()}`);
      if (!el) continue;
      const io = new IntersectionObserver(
        ([e]) => {
          if (e?.isIntersecting) setActive(g);
        },
        { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
      );
      io.observe(el);
      observers.push(io);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, [groups]);

  if (!groups.length) return null;

  return (
    <nav
      aria-label="Feature groups"
      className="lg:sticky lg:top-24 lg:self-start"
    >
      <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {groups.map((g) => (
          <a
            key={g}
            href={`#group-${g.toLowerCase()}`}
            className={cn(
              "shrink-0 rounded-sm px-3 py-2 text-sm transition-colors",
              active === g
                ? "bg-sunken font-medium text-ink"
                : "text-ink-secondary hover:bg-sunken hover:text-ink",
            )}
          >
            {g}
          </a>
        ))}
        <a
          href="#integrations"
          className="shrink-0 rounded-sm px-3 py-2 text-sm text-ink-secondary hover:bg-sunken hover:text-ink"
        >
          Integrations
        </a>
      </div>
    </nav>
  );
}
