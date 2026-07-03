import { Link, useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft, UserPlus, UserCheck, Crown, TrendingUp,
  BarChart3, Users, Calendar, MessageSquare, Send, Trash2, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  plan: string | null;
  createdAt: string;
  totalAnalyses: number;
  avgScore: number;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  sharedAnalyses: Array<{
    id: string;
    title: string | null;
    viralScore: number | null;
    targetPlatform: string | null;
    createdAt: string;
    shareCode: string;
  }>;
}

interface CommentData {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUserId = (user as any)?.id;
  const isOwnProfile = userId === currentUserId;
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ["/api/community/profile", userId],
    queryFn: async () => {
      const res = await fetch(`/api/community/profile/${userId}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!userId,
  });

  const { data: comments } = useQuery<CommentData[]>({
    queryKey: ["/api/analysis-comments", selectedAnalysis],
    queryFn: async () => {
      const res = await fetch(`/api/analysis-comments/${selectedAnalysis}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedAnalysis,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const method = profile?.isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/community/follow/${userId}`, { method });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/community/creators"] });
      toast({ title: profile?.isFollowing ? "Unfollowed" : "Following!" });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/analysis-comments/${selectedAnalysis}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["/api/analysis-comments", selectedAnalysis] });
      toast({ title: "Comment posted!" });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/analysis-comments/${commentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analysis-comments", selectedAnalysis] });
    },
  });

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-slate-400";
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-orange-400";
    if (score >= 40) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number | null) => {
    if (!score) return "bg-slate-500/20";
    if (score >= 80) return "bg-emerald-500/20";
    if (score >= 60) return "bg-orange-500/20";
    if (score >= 40) return "bg-amber-500/20";
    return "bg-red-500/20";
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-slate-800" />
              <div className="space-y-3 flex-1">
                <div className="h-6 w-48 bg-slate-800 rounded" />
                <div className="h-4 w-32 bg-slate-800/50 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="h-20 bg-slate-800/50 rounded-xl" />
              <div className="h-20 bg-slate-800/50 rounded-xl" />
              <div className="h-20 bg-slate-800/50 rounded-xl" />
              <div className="h-20 bg-slate-800/50 rounded-xl" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-16">
          <Users className="h-16 w-16 text-slate-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-300 mb-2">User not found</h2>
          <Link href="/community">
            <Button variant="outline" className="border-slate-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Community
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/community">
          <Button variant="ghost" className="text-slate-400 hover:text-white -ml-2" data-testid="button-back-community">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Community
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt=""
                className="h-24 w-24 rounded-full object-cover ring-4 ring-slate-800"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-slate-800">
                {profile.firstName?.[0] || "?"}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold" data-testid="text-profile-name">
                  {profile.firstName || "Anonymous"} {profile.lastName || ""}
                </h1>
                {profile.plan === "pro" && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
                    <Crown className="h-3 w-3" />
                    Pro
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm">
                Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
            {!isOwnProfile && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigate(`/messages?to=${userId}`)}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                  data-testid="button-message-user"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  className={profile.isFollowing
                    ? "bg-slate-800 hover:bg-slate-700 text-white"
                    : "bg-orange-600 hover:bg-orange-700"
                  }
                  data-testid="button-follow-toggle"
                >
                  {profile.isFollowing ? (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-800/40 rounded-xl p-4 text-center">
              <BarChart3 className="h-5 w-5 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{Number(profile.totalAnalyses)}</div>
              <div className="text-xs text-slate-500">Analyses</div>
            </div>
            <div className="bg-slate-800/40 rounded-xl p-4 text-center">
              <TrendingUp className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${getScoreColor(Number(profile.avgScore))}`}>
                {Number(profile.avgScore) || "--"}
              </div>
              <div className="text-xs text-slate-500">Avg Score</div>
            </div>
            <div className="bg-slate-800/40 rounded-xl p-4 text-center">
              <Users className="h-5 w-5 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{Number(profile.followerCount)}</div>
              <div className="text-xs text-slate-500">Followers</div>
            </div>
            <div className="bg-slate-800/40 rounded-xl p-4 text-center">
              <Calendar className="h-5 w-5 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{Number(profile.followingCount)}</div>
              <div className="text-xs text-slate-500">Following</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Shared Analyses</h2>
          {!profile.sharedAnalyses || profile.sharedAnalyses.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">No shared analyses yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.sharedAnalyses.map((analysis) => (
                <div key={analysis.id}>
                  <div
                    className={`flex items-center gap-4 p-4 rounded-xl transition-colors cursor-pointer ${
                      selectedAnalysis === analysis.id
                        ? "bg-orange-500/10 border border-orange-500/20"
                        : "bg-slate-800/30 hover:bg-slate-800/50"
                    }`}
                    onClick={() => setSelectedAnalysis(selectedAnalysis === analysis.id ? null : analysis.id)}
                    data-testid={`card-shared-analysis-${analysis.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{analysis.title || "Untitled"}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="capitalize">{analysis.targetPlatform || "Unknown"}</span>
                        <span>·</span>
                        <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-lg ${getScoreBg(analysis.viralScore)}`}>
                      <span className={`text-xl font-bold ${getScoreColor(analysis.viralScore)}`}>
                        {analysis.viralScore || "--"}
                      </span>
                    </div>
                    <Link href={`/share/${analysis.shareCode}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-orange-400 hover:text-orange-300"
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`button-view-analysis-${analysis.id}`}
                      >
                        View
                      </Button>
                    </Link>
                  </div>

                  {selectedAnalysis === analysis.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 ml-4 p-4 bg-slate-800/20 rounded-xl border border-slate-800/30"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-300">
                          Comments {comments ? `(${comments.length})` : ""}
                        </span>
                      </div>

                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          placeholder="Leave a comment or tip..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && commentText.trim()) {
                              commentMutation.mutate();
                            }
                          }}
                          className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
                          data-testid="input-comment"
                        />
                        <Button
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700"
                          disabled={!commentText.trim() || commentMutation.isPending}
                          onClick={() => commentMutation.mutate()}
                          data-testid="button-submit-comment"
                        >
                          {commentMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {comments && comments.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {comments.map((comment) => (
                            <div
                              key={comment.id}
                              className="flex items-start gap-3 p-3 bg-slate-900/30 rounded-lg"
                              data-testid={`comment-${comment.id}`}
                            >
                              {comment.profileImageUrl ? (
                                <img src={comment.profileImageUrl} alt="" className="h-8 w-8 rounded-full" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-sm font-semibold">
                                  {comment.firstName?.[0] || "?"}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Link href={`/profile/${comment.userId}`}>
                                    <span className="text-sm font-medium text-white hover:text-orange-300 cursor-pointer">
                                      {comment.firstName || "Anonymous"}
                                    </span>
                                  </Link>
                                  <span className="text-xs text-slate-500">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-300">{comment.text}</p>
                              </div>
                              {comment.userId === currentUserId && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-slate-500 hover:text-red-400"
                                  onClick={() => deleteCommentMutation.mutate(comment.id)}
                                  data-testid={`button-delete-comment-${comment.id}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 text-center py-3">
                          No comments yet. Be the first to share your thoughts!
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
