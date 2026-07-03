import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "indigo" | "emerald" | "amber" | "rose" | "cyan" | "purple";
  delay?: number;
  className?: string;
  testId?: string;
}

const toneMap: Record<string, string> = {
  indigo: "bg-orange-500/15 text-orange-300",
  emerald: "bg-emerald-500/15 text-emerald-300",
  amber: "bg-amber-500/15 text-amber-300",
  rose: "bg-rose-500/15 text-rose-300",
  cyan: "bg-cyan-500/15 text-cyan-300",
  purple: "bg-amber-500/15 text-amber-300",
};

export function StatTile({ icon: Icon, label, value, hint, tone = "indigo", delay = 0, className, testId }: StatTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], delay }}
      className={cn("card-base card-hover p-5", className)}
      data-testid={testId}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center", toneMap[tone])}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-meta">{label}</span>
      </div>
      <div className="text-display text-3xl text-white tabular-nums">{value}</div>
      {hint && <div className="text-meta mt-1.5">{hint}</div>}
    </motion.div>
  );
}
