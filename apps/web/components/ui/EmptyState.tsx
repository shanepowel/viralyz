import Link from "next/link";
import { cn } from "@/lib/cn";
import { buttonClasses } from "@/components/ui/Button";

export function EmptyState({
  heading,
  body,
  action,
  className,
}: {
  heading: string;
  body: string;
  action?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-line bg-raised p-8 text-center shadow-sm",
        className,
      )}
    >
      <h3 className="text-lg font-semibold text-ink">{heading}</h3>
      <p className="mt-2 text-sm text-ink-secondary leading-relaxed max-w-md mx-auto">
        {body}
      </p>
      {action ? (
        <Link
          href={action.href}
          className={cn(buttonClasses({ variant: "secondary", size: "sm" }), "mt-5")}
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
