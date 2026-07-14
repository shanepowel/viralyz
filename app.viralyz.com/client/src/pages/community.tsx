import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Users, Search, UserPlus, Crown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Creator {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  plan: string | null;
  createdAt: string;
  totalAnalyses: number;
  avgScore: number;
  followerCount: number;
}

export default function Community() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const currentUserId = (user as any)?.id;

  const { data: creators, isLoading } = useQuery<Creator[]>({
    queryKey: ["/api/community/creators"],
    queryFn: async () => {
      const res = await fetch("/api/community/creators");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/community/follow/${userId}`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to follow");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/creators"] });
      toast({ title: "Followed!" });
    },
    onError: (err: Error) => {
      toast({ title: err.message, variant: "destructive" });
    },
  });

  const filteredCreators = creators?.filter((c) => {
    if (!search.trim()) return true;
    const name = `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  }) || [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-indigo-400";
    if (score >= 40) return "text-amber-400";
    return "text-slate-400";
  };

  const SkeletonCard = () => (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-14 w-14 rounded-full bg-slate-800" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 bg-slate-800 rounded" />
          <div className="h-3 w-20 bg-slate-800/50 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="h-12 bg-slate-800/50 rounded-lg" />
        <div className="h-12 bg-slate-800/50 rounded-lg" />
        <div className="h-12 bg-slate-800/50 rounded-lg" />
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-indigo-400" />
            <h1 className="text-3xl font-bold" data-testid="text-community-title">Community</h1>
          </div>
          <p className="text-slate-400">Discover creators, follow their journey, and learn from the best</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search creators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-800/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              data-testid="input-search-creators"
            />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredCreators.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              {search ? "No creators found" : "No creators yet"}
            </h3>
            <p className="text-slate-500">
              {search ? "Try a different search term" : "Be the first to analyze content and appear here!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCreators.map((creator, i) => {
              const isOwnProfile = creator.id === currentUserId;
              return (
                <motion.div
                  key={creator.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(0.05 * i, 0.3) }}
                  className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 hover:border-slate-700/50 transition-colors group"
                  data-testid={`card-creator-${creator.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Link href={`/profile/${creator.id}`}>
                      <div className="flex items-center gap-3 cursor-pointer">
                        {creator.profileImageUrl ? (
                          <img
                            src={creator.profileImageUrl}
                            alt=""
                            className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-800 group-hover:ring-indigo-500/30 transition-all"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold ring-2 ring-slate-800 group-hover:ring-indigo-500/30 transition-all">
                            {creator.firstName?.[0] || "?"}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                              {creator.firstName || "Anonymous"} {creator.lastName?.[0] ? `${creator.lastName[0]}.` : ""}
                            </span>
                            {creator.plan === "pro" && (
                              <Crown className="h-4 w-4 text-amber-400" />
                            )}
                          </div>
                          <span className="text-sm text-slate-500">
                            {Number(creator.followerCount)} follower{Number(creator.followerCount) !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-slate-800/40 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-white">{Number(creator.totalAnalyses)}</div>
                      <div className="text-xs text-slate-500">Analyses</div>
                    </div>
                    <div className="bg-slate-800/40 rounded-lg p-3 text-center">
                      <div className={`text-lg font-bold ${getScoreColor(Number(creator.avgScore))}`}>
                        {Number(creator.avgScore) || "--"}
                      </div>
                      <div className="text-xs text-slate-500">Avg Score</div>
                    </div>
                    <div className="bg-slate-800/40 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-indigo-400">
                        {Number(creator.followerCount)}
                      </div>
                      <div className="text-xs text-slate-500">Followers</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/profile/${creator.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                        data-testid={`button-view-profile-${creator.id}`}
                      >
                        View Profile
                      </Button>
                    </Link>
                    {!isOwnProfile && (
                      <>
                        <Button
                          size="icon"
                          variant="outline"
                          className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                          data-testid={`button-message-${creator.id}`}
                          onClick={() => navigate(`/messages?to=${creator.id}`)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          className="bg-indigo-600 hover:bg-indigo-700"
                          data-testid={`button-follow-${creator.id}`}
                          onClick={() => followMutation.mutate(creator.id)}
                          disabled={followMutation.isPending}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
