import { Shell } from "@/components/layout/Shell";
import { Search, TrendingUp, Flame, Users, Hash, Play, SearchX } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { TribeCardSkeleton, DiscoverGridSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface ContentItem {
  id: string;
  title: string | null;
  type: string;
  thumbnail: string | null;
  views: number;
  likes: number;
}

interface Tribe {
  id: string;
  name: string;
  slug: string;
  members: number;
  icon: string | null;
}

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: content = [], isLoading: contentLoading } = useQuery<ContentItem[]>({
    queryKey: ["/api/content"],
  });

  const { data: tribes = [], isLoading: tribesLoading } = useQuery<Tribe[]>({
    queryKey: ["/api/tribes"],
  });

  const trends = ["#NeonCity", "#CyberPunk", "#NightLife", "#RetroWave", "#SynthPop", "#GlitchArt", "#Creator", "#Viral"];

  const filteredContent = searchQuery 
    ? content.filter(c => c.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : content;

  return (
    <Shell>
      <div className="space-y-8">
        {/* Search Header */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-display text-white">Discover</h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for clips, films, creators..."
              className="w-full rounded-full border border-white/10 bg-white/5 py-4 pl-12 pr-6 text-white backdrop-blur-md transition-all focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
              data-testid="search-input"
            />
          </div>
        </div>

        {/* Trending Tags */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-bold text-white">Trending Now</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {trends.map(tag => (
              <motion.span 
                key={tag} 
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium hover:bg-primary/20 hover:border-primary/50 cursor-pointer transition-colors text-white"
                data-testid={`tag-${tag.replace('#', '')}`}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </section>

        {/* Popular Tribes */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-bold text-white">Popular Tribes</h2>
            </div>
          </div>
          
          {tribesLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
              {Array.from({ length: 5 }).map((_, i) => (
                <TribeCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
              {tribes.map(tribe => (
                <motion.div 
                  key={tribe.id}
                  whileHover={{ y: -4 }}
                  className="flex-shrink-0 w-36 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 cursor-pointer transition-all text-center"
                  data-testid={`tribe-${tribe.slug}`}
                >
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl mx-auto mb-3">
                    {tribe.icon || '🌐'}
                  </div>
                  <h3 className="font-bold text-white text-sm truncate">{tribe.name}</h3>
                  <p className="text-xs text-muted-foreground">{tribe.members.toLocaleString()} members</p>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Trending Content Grid */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Hash className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Explore Content</h2>
          </div>
          
          {contentLoading ? (
            <DiscoverGridSkeleton count={8} />
          ) : filteredContent.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12"
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <SearchX className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {searchQuery ? `No results for "${searchQuery}"` : "No content yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Try a different search term" : "Be the first to create something amazing!"}
                </p>
                {!searchQuery && (
                  <Link href="/create">
                    <Button>Create Content</Button>
                  </Link>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredContent.map((item, i) => (
                <Link key={item.id} href={`/content/${item.id}`}>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`relative group overflow-hidden rounded-xl bg-white/5 cursor-pointer ${i % 5 === 0 ? 'row-span-2 aspect-[9/16]' : 'aspect-[4/5]'}`}
                    data-testid={`discover-item-${item.id}`}
                  >
                    {item.thumbnail ? (
                      <img 
                        src={item.thumbnail} 
                        className="object-cover w-full h-full transition duration-500 group-hover:scale-110" 
                        alt={item.title || 'Content'}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                        <Play className="h-12 w-12 text-white/60" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <p className="text-white font-bold text-sm line-clamp-2">{item.title || 'Untitled'}</p>
                      <p className="text-xs text-white/70">{item.views.toLocaleString()} views</p>
                    </div>
                    
                    {item.type === 'clip' && (
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5 text-[10px] font-bold text-white">
                        CLIP
                      </div>
                    )}
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}
