import { useState, useEffect } from "react";
import { X, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HintProps {
  id: string;
  title: string;
  description: string;
  className?: string;
  position?: "top" | "bottom";
  showOnce?: boolean;
}

export function Hint({ id, title, description, className, position = "bottom", showOnce = true }: HintProps) {
  const storageKey = `hint-dismissed-${id}`;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (showOnce) {
      const dismissed = localStorage.getItem(storageKey);
      if (!dismissed) {
        const timer = setTimeout(() => setVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    } else {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [storageKey, showOnce]);

  const dismiss = () => {
    setVisible(false);
    if (showOnce) {
      localStorage.setItem(storageKey, "true");
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: position === "top" ? -10 : 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position === "top" ? -10 : 10, scale: 0.95 }}
          className={cn(
            "absolute z-50 w-64 p-3 rounded-xl bg-primary/95 backdrop-blur-sm text-white shadow-xl shadow-primary/25",
            position === "top" ? "bottom-full mb-2" : "top-full mt-2",
            className
          )}
        >
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{title}</p>
              <p className="text-xs text-white/80 mt-0.5">{description}</p>
            </div>
            <button 
              onClick={dismiss}
              className="shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Dismiss hint"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className={cn(
            "absolute left-6 w-0 h-0 border-x-8 border-x-transparent",
            position === "top" 
              ? "top-full border-t-8 border-t-primary/95" 
              : "bottom-full border-b-8 border-b-primary/95"
          )} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface FirstTimeHintProps {
  id: string;
  children: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FirstTimeHint({ id, children, title, description, className }: FirstTimeHintProps) {
  return (
    <div className="relative">
      {children}
      <Hint id={id} title={title} description={description} className={className} />
    </div>
  );
}
