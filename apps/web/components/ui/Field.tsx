import { cloneElement, isValidElement } from "react";
import { cn } from "@/lib/cn";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-sm border border-line bg-raised px-3.5 text-sm text-ink placeholder:text-ink-tertiary shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-sm border border-line bg-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-tertiary shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-sm font-medium text-ink mb-1.5", className)}
      {...props}
    />
  );
}

export function Field({
  id,
  label,
  description,
  error,
  children,
}: {
  id: string;
  label: string;
  description?: string;
  error?: string;
  children: React.ReactElement<{
    id?: string;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
  }>;
}) {
  const descId = description ? `${id}-desc` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [descId, errId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {description ? (
        <p id={descId} className="text-sm text-ink-tertiary">
          {description}
        </p>
      ) : null}
      {isValidElement(children)
        ? cloneElement(children, {
            id,
            "aria-invalid": Boolean(error) || undefined,
            "aria-describedby": describedBy,
          })
        : children}
      {error ? (
        <p id={errId} className="text-sm text-score-low" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
