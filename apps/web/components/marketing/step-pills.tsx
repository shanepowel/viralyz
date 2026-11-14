import Link from "next/link";
import { features } from "@/data/features";
import { cn } from "@/lib/cn";

/** The five platform steps as one segmented row, with the current one filled. */
export function StepPills({ current }: { current: string }) {
  return (
    <nav aria-label="Platform steps">
      <ul className="m-0 inline-flex list-none flex-wrap border border-rule p-0 text-sm">
        {features.map((f) => {
          const active = f.slug === current;
          return (
            <li key={f.slug}>
              <Link
                href={`/platform/${f.slug}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center border-r border-rule px-3.5 font-medium",
                  active
                    ? "bg-ink text-bg hover:text-bg"
                    : "text-ink hover:bg-panel",
                )}
              >
                {f.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
