import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { features } from "@/data/features";

/**
 * The product loop: five stages left to right, with Results feeding back
 * into Studio. Stacks vertically on small screens.
 */
export function LoopDiagram() {
  return (
    <div>
      <ol className="grid gap-2 md:grid-cols-[repeat(5,minmax(0,1fr))] md:gap-0">
        {features.map((f, i) => (
          <li key={f.slug} className="flex flex-col items-stretch md:flex-row">
            <Link
              href={`/platform/${f.slug}`}
              className="group flex-1 rounded-md border border-line bg-raised p-4 shadow-sm transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span className="font-mono text-xs text-accent">
                {String(f.step).padStart(2, "0")}
              </span>
              <span className="mt-1 block font-display text-base font-semibold text-ink group-hover:text-accent">
                {f.name}
              </span>
              <span className="mt-1 block text-[13px] leading-snug text-ink-tertiary">
                {f.tagline}
              </span>
            </Link>
            {i < features.length - 1 ? (
              <span
                className="flex items-center justify-center py-1 text-ink-tertiary md:w-6 md:shrink-0 md:py-0"
                aria-hidden
              >
                <ArrowDown className="h-4 w-4 md:hidden" />
                <ArrowRight className="hidden h-4 w-4 md:block" />
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      {/* Feedback path: Results (stage 5) back to Studio (stage 3). */}
      <div className="mt-3 hidden md:grid md:grid-cols-[repeat(5,minmax(0,1fr))]" aria-hidden>
        <div className="col-start-3 col-end-6 px-[12%]">
          <div className="h-5 rounded-b-md border-x-2 border-b-2 border-dashed border-accent/50" />
        </div>
      </div>
      <p className="mt-3 text-sm text-ink-secondary md:text-center">
        <span className="font-medium text-accent">↺ The loop closes:</span>{" "}
        your imported results show how well the pre-flight checks predicted
        click-through, so each round of Studio work starts better informed.
      </p>
    </div>
  );
}
