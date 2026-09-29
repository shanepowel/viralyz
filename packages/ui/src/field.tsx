import { cloneElement, isValidElement, type ReactElement } from "react";
import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "./lib/cn";

const controlClass =
  "w-full rounded-sm border border-line bg-raised text-sm text-ink shadow-sm transition-colors placeholder:text-ink-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 aria-[invalid=true]:border-score-low";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input className={cn(controlClass, "h-11 px-3.5", className)} {...props} />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(controlClass, "min-h-28 px-3.5 py-2.5", className)}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-ink", className)}
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
  children: ReactElement<{
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

export function FieldHint({ children }: { children: ReactNode }) {
  return <p className="text-sm text-ink-tertiary">{children}</p>;
}
