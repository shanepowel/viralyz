import { Shell } from "@/components/layout/Shell";
import { FeedCard, FeedItemProps } from "@/components/feed/FeedCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlashesBar } from "@/components/feed/FlashesBar";
import { ImmersiveViewer } from "@/components/feed/ImmersiveViewer";
import { useState } from "react";
import { useContent, type Content } from "@/lib/api";
import { Plus, Sparkles, Film, Image, Zap, TrendingUp, Rocket, Video, Camera } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FeedSkeleton } from "@/components/ui/skeleton";

function contentToFeedItem(content: Content): FeedItemProps {
  return {
    id: content.id,
    type: content.type as "clip" | "film" | "still",
    src: content.src,
    thumbnail: content.thumbnail || undefined,
    author: {
      name: "Creator",
      handle: "creator",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + content.userId,
    },
    description: content.description || content.title || "",
    likes: content.likes,
    comments: 0,
    aspectRatio: content.aspectRatio || undefined,
  };
}

const platformIcons = [
  { name: 'YouTube', color: 'from-red-500 to-red-600', letter: 'Y' },
  { name: 'TikTok', color: 'from-black to-gray-800', letter: 'T' },
  { name: 'Instagram', color: 'from-purple-500 via-pink-500 to-orange-500', letter: 'I' },
  { name: 'Twitch', color: 'from-purple-600 to-purple-700', letter: 'Tw' },
  { name: 'Twitter', color: 'from-gray-700 to-black', letter: 'X' },
];

const quickActions = [
  { type: 'clip', icon: Sparkles, label: 'Clip', color: 'bg-pink-500/20 text-pink-400 hover:bg-pink-500 hover:text-foreground' },
  { type: 'film', icon: Film, label: 'Film', color: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-foreground' },
  { type: 'still', icon: Image, label: 'Still', color: 'bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-foreground' },
  { type: 'flash', icon: Zap, label: 'Flash', color: 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500 hover:text-foreground' },
];

export default function Home() {
  const [selectedItem, setSelectedItem] = useState<FeedItemProps | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  const contentType = activeTab === "all" ? undefined : activeTab.slice(0, -1);
  const { data: content, isLoading } = useContent(contentType);

  const feedItems = content?.map(contentToFeedItem) || [];

  return (
    <Shell>
      <div className="mx-auto max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">For You</h1>
              </div>
              <p className="text-muted-foreground">Content curated for your taste</p>
            </div>
            <Link href="/create">
              <Button className="gap-2" data-testid="create-button">
                <Plus className="h-4 w-4" />
                Create
              </Button>
            </Link>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-2xl border border-border mb-6"
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 animate-gradient-x" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(168,85,247,0.15),transparent_50%)]" />
            
            <div className="relative p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-semibold text-foreground">Cross-Platform Publishing</p>
                </div>
                <p className="text-xs text-muted-foreground">Create once, share everywhere</p>
              </div>
              <div className="flex items-center gap-1.5">
                {platformIcons.map((platform, i) => (
                  <motion.div 
                    key={platform.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`h-8 w-8 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center text-xs font-bold text-white shadow-lg`}
                    title={platform.name}
                  >
                    {platform.letter}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
            {quickActions.map((action, i) => (
              <Link key={action.type} href={`/create?type=${action.type}`}>
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shadow-lg ${action.color}`}
                  data-testid={`quick-${action.type}`}
                >
                  <action.icon className="h-4 w-4" />
                  <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
                </motion.button>
              </Link>
            ))}
          </div>
        </motion.div>

        <FlashesBar />

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
          <TabsList className="bg-secondary border border-border p-1 w-full justify-start overflow-x-auto hide-scrollbar">
            <TabsTrigger 
              value="all" 
              data-testid="tab-all"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg"
            >
              All Content
            </TabsTrigger>
            <TabsTrigger 
              value="clips" 
              data-testid="tab-clips"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg"
            >
              Clips
            </TabsTrigger>
            <TabsTrigger 
              value="films" 
              data-testid="tab-films"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg"
            >
              Films
            </TabsTrigger>
            <TabsTrigger 
              value="stills" 
              data-testid="tab-stills"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg"
            >
              Stills
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <FeedSkeleton count={3} />
        ) : feedItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-12" 
            data-testid="empty-state"
          >
            <div className="rounded-3xl border border-border bg-gradient-to-b from-white/5 to-transparent p-8 text-center">
              <div className="relative mx-auto mb-6 h-24 w-24">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 animate-pulse" />
                <div className="relative h-full w-full rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Rocket className="h-10 w-10 text-foreground" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Your feed is empty</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Be the first to create content! Share clips, films, stills, or quick flashes with the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/create?type=clip">
                  <Button className="gap-2 w-full sm:w-auto">
                    <Video className="h-4 w-4" />
                    Create a Clip
                  </Button>
                </Link>
                <Link href="/create?type=still">
                  <Button variant="outline" className="gap-2 w-full sm:w-auto">
                    <Camera className="h-4 w-4" />
                    Post a Still
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-6">
                Content you create will appear in your feed and can be shared to YouTube, TikTok, Instagram, and more.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {feedItems.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedItem(item)} 
                className="cursor-pointer"
                data-testid={`feed-item-${item.id}`}
              >
                <FeedCard item={item} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ImmersiveViewer 
        item={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </Shell>
  );
}
