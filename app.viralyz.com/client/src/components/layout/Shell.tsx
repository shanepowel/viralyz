import { Navigation } from "./Navigation";
import { FloatingAction } from "@/components/ui/FloatingAction";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="z-10 flex w-full">
         <Navigation />
         <main className="flex-1 pb-20 md:pb-0 md:pl-64">
           <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
             {children}
           </div>
         </main>
         <FloatingAction />
      </div>
    </div>
  );
}
