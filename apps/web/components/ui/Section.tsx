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
        "py-16 md:py-24",
        tone === "sunken" && "bg-sunken",
        className,
      )}
      {...props}
    >
      {bleed ? children : <Container>{children}</Container>}
    </section>
  );
}
