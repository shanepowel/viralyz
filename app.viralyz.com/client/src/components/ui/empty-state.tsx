import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "card-base text-center py-14 px-6 flex flex-col items-center",
        className
      )}
      data-testid="empty-state"
    >
      <div className="h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-h3 text-white mb-1.5" data-testid="text-empty-title">{title}</h3>
      {description && <p className="text-slate-400 text-sm max-w-sm mb-5">{description}</p>}
      {action}
    </div>
  );
}
