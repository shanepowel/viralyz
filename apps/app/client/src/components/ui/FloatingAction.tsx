import { Plus } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

const quickActions: QuickAction[] = [
  { label: "Clip", href: "/create?type=clip", icon: "📹", color: "from-red-500 to-pink-500" },
  { label: "Film", href: "/create?type=film", icon: "🎬", color: "from-blue-500 to-purple-500" },
  { label: "Still", href: "/create?type=still", icon: "📷", color: "from-green-500 to-teal-500" },
  { label: "Flash", href: "/create?type=flash", icon: "⚡", color: "from-yellow-500 to-orange-500" },
];

export function FloatingAction() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 z-40 md:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 flex flex-col gap-2 items-end"
          >
            {quickActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={action.href} onClick={() => setIsOpen(false)}>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-xl backdrop-blur-xl">
                    <span className="text-lg">{action.icon}</span>
                    <span className="text-sm font-medium text-foreground">{action.label}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all",
          isOpen 
            ? "bg-card border border-border rotate-45" 
            : "bg-gradient-to-r from-primary to-accent shadow-primary/30"
        )}
        whileTap={{ scale: 0.95 }}
        data-testid="fab-create"
      >
        <Plus className={cn("h-6 w-6 transition-transform", isOpen ? "text-foreground" : "text-primary-foreground", isOpen && "rotate-0")} />
      </motion.button>
    </div>
  );
}
