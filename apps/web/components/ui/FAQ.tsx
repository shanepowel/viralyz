import { cn } from "@/lib/cn";

export type FaqItem = { q: string; a: React.ReactNode };

/** <details>/<summary> rows on panel-coloured rounded rows. */
export function FAQ({
  items,
  className,
}: {
  items: readonly FaqItem[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {items.map((item) => (
        <details
          key={item.q}
          className="group rounded-2xl bg-panel px-[22px] py-1"
        >
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold [&::-webkit-details-marker]:hidden">
            {item.q}
            <span
              aria-hidden="true"
              className="text-xl font-normal text-muted group-open:hidden"
            >
              +
            </span>
            <span
              aria-hidden="true"
              className="hidden text-xl font-normal text-muted group-open:inline"
            >
              −
            </span>
          </summary>
          <div className="mb-[18px] text-muted">{item.a}</div>
        </details>
      ))}
    </div>
  );
}
