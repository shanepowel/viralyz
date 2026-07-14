import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, Play, Volume2, VolumeX, Bookmark } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export type ContentType = "clip" | "film" | "still";

export interface FeedItemProps {
  id: string;
  type: ContentType;
  src: string;
  thumbnail?: string;
  author: {
    name: string;
    avatar: string;
    handle: string;
  };
  description: string;
  likes: number;
  comments: number;
  aspectRatio?: string;
}

export function FeedCard({ item }: { item: FeedItemProps }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    if (!isLiked) {
      toast({
        title: "Liked!",
        description: "Added to your liked content",
      });
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from saved" : "Saved!",
      description: isSaved ? "Removed from your collection" : "Added to your saved collection",
    });
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: item.description,
          text: `Check out this ${item.type} on Viralyz`,
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        toast({
          title: "Link copied!",
          description: "Share link copied to clipboard",
        });
      }
    } catch {
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
      });
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const isVertical = item.type === "clip";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "group relative mb-8 overflow-hidden rounded-3xl border border-white/5 bg-card/40 backdrop-blur-sm transition-all hover:border-white/10",
        isVertical ? "max-w-md mx-auto aspect-[9/16]" : "w-full aspect-video"
      )}
    >
      {/* Content Container */}
      <div className="absolute inset-0 bg-black/50" onClick={togglePlay}>
        {item.type === "still" ? (
          <img
            src={item.src}
            alt={item.description}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              src={item.src}
              poster={item.thumbnail}
              className="h-full w-full object-cover"
              loop
              muted={isMuted}
              playsInline
            />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform group-hover:scale-110">
                  <Play className="ml-1 h-8 w-8 text-white fill-white" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Overlay Info */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6">
        <div className="flex items-end justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={item.author.avatar}
                alt={item.author.name}
                className="h-10 w-10 rounded-full border-2 border-primary"
              />
              <div>
                <h3 className="font-display font-bold text-white shadow-black drop-shadow-md">
                  {item.author.name}
                </h3>
                <p className="text-xs text-white/80">@{item.author.handle}</p>
              </div>
              <button className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/20">
                Follow
              </button>
            </div>
            
            <p className="line-clamp-2 text-sm text-white/90 drop-shadow-md">
              {item.description} <span className="text-accent hover:underline">#prism</span>
            </p>
          </div>

          {/* Action Sidebar */}
          <div className="flex flex-col items-center gap-4 text-white">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="group flex flex-col items-center gap-1"
              data-testid={`like-${item.id}`}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all",
                isLiked 
                  ? "bg-red-500/30 text-red-500" 
                  : "bg-white/10 group-hover:bg-primary/20 group-hover:text-primary"
              )}>
                <Heart className={cn("h-5 w-5 transition-all", isLiked && "fill-red-500")} />
              </div>
              <span className="text-xs font-medium">{likeCount}</span>
            </motion.button>
            
            <button className="group flex flex-col items-center gap-1" data-testid={`comment-${item.id}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-colors group-hover:bg-accent/20 group-hover:text-accent">
                <MessageCircle className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">{item.comments}</span>
            </button>

            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-colors hover:bg-white/20"
              data-testid={`share-${item.id}`}
            >
              <Share2 className="h-5 w-5" />
            </motion.button>

            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={handleSave}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all",
                isSaved 
                  ? "bg-primary/30 text-primary" 
                  : "bg-white/10 hover:bg-white/20"
              )}
              data-testid={`save-${item.id}`}
            >
              <Bookmark className={cn("h-5 w-5 transition-all", isSaved && "fill-primary")} />
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Top Controls */}
      {item.type !== "still" && (
        <div className="absolute right-4 top-4 flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60">
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
        </div>
      )}
    </motion.div>
  );
}
