import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, children, className }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex items-start justify-between gap-6 flex-wrap pb-6", className)}
    >
      <div className="min-w-0 flex-1">
        {eyebrow && <div className="text-eyebrow mb-2" data-testid="text-page-eyebrow">{eyebrow}</div>}
        <h1 className="text-h1 text-white" data-testid="text-page-title">{title}</h1>
        {description && (
          <p className="mt-2 text-slate-400 max-w-2xl" data-testid="text-page-description">{description}</p>
        )}
        {children}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </motion.div>
  );
}
