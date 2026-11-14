import { MarketingShell } from "@/components/marketing/marketing-shell";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { routes } from "@/lib/site";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <MarketingShell>
      <Container className="flex min-h-[60vh] flex-col justify-center py-20">
        <p className="kicker m-0">Error 404</p>
        <h1 className="m-0 mt-3 max-w-[820px] font-display text-[clamp(40px,6vw,72px)]">
          There is no page at this address.
        </h1>
        <p className="m-0 mt-4 max-w-[560px] text-[19px] text-ink-2">
          The link may be old, or the address may have a typo. These are the pages people usually want.
        </p>
        <div className="mt-8 flex flex-wrap gap-2.5">
          <ButtonLink href={routes.platform}>How it works</ButtonLink>
          <ButtonLink href={routes.pricing} variant="secondary">
            Pricing
          </ButtonLink>
          <ButtonLink href={routes.signup} variant="secondary">
            Start free
          </ButtonLink>
        </div>
      </Container>
    </MarketingShell>
  );
}
