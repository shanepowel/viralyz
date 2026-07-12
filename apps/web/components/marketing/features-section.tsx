import { MARKETING_FEATURES } from "@repo/config";
import { AppCtaLink } from "@/components/marketing/app-cta-link";
import {
  ArrowUpRight,
  FileText,
  Lightbulb,
  Radar,
  Target,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Target,
  Zap,
  FileText,
  Lightbulb,
  Radar,
  Users,
};

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Everything You Need to Go Viral
          </h2>
          <p className="mt-3 text-muted-foreground">AI-powered tools that actually work</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MARKETING_FEATURES.map((feature) => {
            const Icon = iconMap[feature.icon] ?? Target;
            return (
              <AppCtaLink
                key={feature.title}
                href={feature.href}
                variant="ghost"
                className="card-base card-hover group h-auto flex-col items-start rounded-2xl p-6 text-left"
              >
                <div className="mb-4 flex w-full items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary/25">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <h3 className="font-display mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </AppCtaLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
