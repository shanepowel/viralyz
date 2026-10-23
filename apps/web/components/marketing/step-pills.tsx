import Link from "next/link";
import { features } from "@/data/features";
import { cn } from "@/lib/cn";

/** The five platform steps as pills, with the current one filled. */
export function StepPills({ current }: { current: string }) {
  return (
    <nav aria-label="Platform steps">
      <ul className="m-0 flex list-none flex-wrap justify-center gap-1.5 p-0 text-sm">
        {features.map((f) => {
          const active = f.slug === current;
          return (
            <li key={f.slug}>
              <Link
                href={`/platform/${f.slug}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full px-3.5",
                  active
                    ? "bg-ink font-semibold text-bg hover:text-bg"
                    : "text-muted hover:text-ink",
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
