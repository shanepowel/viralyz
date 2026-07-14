import { X, Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FeedItemProps } from "@/components/feed/FeedCard";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ImmersiveViewerProps {
  item: FeedItemProps | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ImmersiveViewer({ item, isOpen, onClose }: ImmersiveViewerProps) {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[100vw] h-[100dvh] md:max-w-4xl md:h-[90vh] p-0 border-none bg-black/95 text-white overflow-hidden flex flex-col md:flex-row gap-0">
        
        {/* Close Button (Mobile) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/20 text-white backdrop-blur-md md:hidden"
        >
          <X size={24} />
        </button>

        {/* Media Section */}
        <div className="relative flex-1 bg-black flex items-center justify-center h-full">
           {item.type === "still" ? (
             <img src={item.src} className="max-h-full max-w-full object-contain" />
           ) : (
             <video 
               src={item.src} 
               className="max-h-full max-w-full object-contain" 
               autoPlay 
               loop 
               controls={false}
               playsInline
             />
           )}
        </div>

        {/* Info/Comments Sidebar (Desktop) or Overlay (Mobile) */}
        <div className="absolute inset-x-0 bottom-0 md:static md:w-[400px] bg-gradient-to-t from-black via-black/60 to-transparent md:bg-card/20 md:backdrop-blur-xl md:border-l md:border-white/10 flex flex-col p-6 md:p-8">
            {/* Header (Desktop only) */}
            <div className="hidden md:flex justify-between items-center mb-6">
                 <h2 className="font-display font-bold text-xl">Comments</h2>
                 <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X /></button>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-3 mb-4">
                <img src={item.author.avatar} className="w-10 h-10 rounded-full border border-white/20" />
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{item.author.name}</h3>
                    <p className="text-xs text-white/60">@{item.author.handle}</p>
                </div>
                <button className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-full text-sm font-bold transition-colors">
                    Follow
                </button>
            </div>

            <p className="text-sm text-white/90 mb-6 line-clamp-3 md:line-clamp-none">
                {item.description} <span className="text-accent">#prism</span>
            </p>

            {/* Stats Row */}
            <div className="flex items-center justify-between mb-6 md:mb-8 border-y border-white/10 py-4">
                <div className="flex flex-col items-center gap-1">
                    <div className="bg-white/10 p-2 rounded-full"><Heart className="w-5 h-5" /></div>
                    <span className="text-xs">{item.likes}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="bg-white/10 p-2 rounded-full"><MessageCircle className="w-5 h-5" /></div>
                    <span className="text-xs">{item.comments}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="bg-white/10 p-2 rounded-full"><Share2 className="w-5 h-5" /></div>
                    <span className="text-xs">Share</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="bg-white/10 p-2 rounded-full"><MoreHorizontal className="w-5 h-5" /></div>
                    <span className="text-xs">More</span>
                </div>
            </div>

            {/* Comments Area (Desktop Mock) */}
            <div className="hidden md:flex flex-1 flex-col gap-4 overflow-y-auto pr-2">
                 {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
                        <div>
                            <span className="font-bold text-white/80 mr-2">user_{i}</span>
                            <span className="text-white/60">This is absolutely stunning! The colors are amazing. 🔥</span>
                        </div>
                    </div>
                 ))}
            </div>

             {/* Add Comment (Desktop) */}
            <div className="hidden md:block mt-4 relative">
                <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-3 text-sm focus:outline-hidden focus:border-primary"
                />
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
