import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const FLASHES = [
  { id: 1, user: "neondreamer", seed: "neon", hasStory: true, isLive: false },
  { id: 2, user: "astro_mike", seed: "astro", hasStory: true, isLive: true },
  { id: 3, user: "art_daily", seed: "artsy", hasStory: true, isLive: false },
  { id: 4, user: "cyber_queen", seed: "cyber", hasStory: true, isLive: false },
  { id: 5, user: "retro_wave", seed: "retro", hasStory: true, isLive: false },
  { id: 6, user: "pixel_art", seed: "pixel", hasStory: true, isLive: false },
];

function getAvatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

export function FlashesBar() {
  const { user } = useAuth();
  
  return (
    <div className="mb-8 overflow-x-auto pb-4 hide-scrollbar">
      <div className="flex gap-4 px-1">
        {/* Current User Add Story */}
        <div className="flex flex-col items-center gap-2 cursor-pointer group">
          <div className="relative h-16 w-16 md:h-20 md:w-20">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/20 group-hover:border-primary transition-colors" />
            <img 
              src={user?.profileImageUrl || getAvatarUrl('you')}
              className="h-full w-full rounded-full object-cover p-1 opacity-80 group-hover:opacity-100 transition-opacity bg-white/5"
              alt="Your Story"
            />
            <div className="absolute bottom-0 right-0 rounded-full bg-primary p-1 text-white shadow-lg">
              <Plus size={14} strokeWidth={3} />
            </div>
          </div>
          <span className="text-xs font-medium text-white/80">You</span>
        </div>

        {/* Other Users */}
        {FLASHES.map((flash) => (
          <div key={flash.id} className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="relative h-16 w-16 md:h-20 md:w-20">
              {/* Gradient Ring */}
              <div className={cn(
                "absolute inset-0 rounded-full p-[2px]",
                flash.isLive 
                  ? "bg-gradient-to-tr from-red-500 to-orange-500 animate-pulse" 
                  : "bg-gradient-to-tr from-primary to-accent"
              )}>
                <div className="h-full w-full rounded-full bg-background" />
              </div>
              
              <img 
                src={getAvatarUrl(flash.seed)}
                className="absolute inset-[4px] h-[calc(100%-8px)] w-[calc(100%-8px)] rounded-full object-cover transition-transform duration-300 group-hover:scale-105 bg-white/10"
                alt={flash.user}
              />
              
              {flash.isLive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded bg-red-600 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white shadow-lg border border-background">
                  LIVE
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-white/80 max-w-[70px] truncate">{flash.user}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
