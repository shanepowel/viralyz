import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";

export function Section({
  className,
  tone = "default",
  bleed,
  children,
  id,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  tone?: "default" | "sunken";
  bleed?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-14 md:py-20",
        tone === "sunken" && "border-y border-line bg-panel",
        className,
      )}
      {...props}
    >
      {bleed ? children : <Container>{children}</Container>}
    </section>
  );
}
