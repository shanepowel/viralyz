import { useState, useMemo } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shell } from "@/components/layout/Shell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Play, 
  Eye, 
  Clock, 
  Send, 
  Trash2,
  User,
  ArrowLeft
} from "lucide-react";
import type { Content, Comment, User as UserType } from "@shared/schema";
import { calculateViralyzScore } from "@/lib/viralyz-score";
import { ViralyzScoreCard } from "@/components/ViralyzScoreCard";

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

type CommentWithUser = Comment & { author?: UserType };

export default function ContentDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");

  const { data: content, isLoading: contentLoading } = useQuery<Content>({
    queryKey: [`/api/content/${id}`],
    enabled: !!id,
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: [`/api/content/${id}/comments`],
    enabled: !!id,
  });

  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
    enabled: comments.length > 0,
  });

  const viralyzScore = useMemo(() => {
    if (!content || !content.title) return null;
    return calculateViralyzScore({
      title: content.title,
      description: content.description || '',
      type: content.type as 'clip' | 'film' | 'still' | 'flash',
      hasMedia: !!content.src,
      platforms: ['viralyz'],
    });
  }, [content]);

  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest("POST", "/api/comments", { contentId: id, text });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/content/${id}/comments`] });
      setCommentText("");
      toast({ title: "Comment added!" });
    },
    onError: () => {
      toast({ title: "Failed to add comment", variant: "destructive" });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      return apiRequest("DELETE", `/api/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/content/${id}/comments`] });
      toast({ title: "Comment deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete comment", variant: "destructive" });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentMutation.mutate(commentText.trim());
  };

  const getUserForComment = (userId: string): UserType | undefined => {
    return users.find(u => u.id === userId);
  };

  if (contentLoading) {
    return (
      <Shell>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Shell>
    );
  }

  if (!content) {
    return (
      <Shell>
        <div className="max-w-4xl mx-auto py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Content not found</h1>
          <Link href="/discover">
            <Button variant="outline">Go to Discover</Button>
          </Link>
        </div>
      </Shell>
    );
  }

  const isVideo = content.type === "clip" || content.type === "film";

  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title={content.title || "Untitled"}
          breadcrumbs={[
            { label: "Discover", href: "/discover" },
            { label: content.title || "Content" },
          ]}
        />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className={`relative overflow-hidden rounded-2xl bg-black ${content.aspectRatio === "9:16" ? "aspect-[9/16] max-w-sm mx-auto" : "aspect-video"}`}>
              {isVideo ? (
                <>
                  {content.thumbnail && (
                    <img
                      src={content.thumbnail}
                      alt={content.title || "Video"}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                      <Play className="h-8 w-8 text-foreground ml-1" fill="white" />
                    </div>
                  </div>
                  {content.duration && (
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(content.duration)}
                    </div>
                  )}
                </>
              ) : (
                <img
                  src={content.src}
                  alt={content.title || "Image"}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="gap-2 text-foreground/70 hover:text-pink-400">
                  <Heart className="h-5 w-5" />
                  <span>{content.likes.toLocaleString()}</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-foreground/70 hover:text-primary">
                  <MessageCircle className="h-5 w-5" />
                  <span>{comments.length}</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-foreground/70 hover:text-cyan-400">
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </Button>
              </div>
              <div className="flex items-center gap-2 text-foreground/50 text-sm">
                <Eye className="h-4 w-4" />
                <span>{content.views.toLocaleString()} views</span>
              </div>
            </div>

            {content.description && (
              <p className="text-foreground/70 leading-relaxed">{content.description}</p>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            {viralyzScore && (
              <ViralyzScoreCard score={viralyzScore} />
            )}

            <div className="rounded-2xl border border-border bg-secondary backdrop-blur-sm overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Comments ({comments.length})
                </h2>
              </div>

              {user ? (
                <form onSubmit={handleSubmitComment} className="p-4 border-b border-border">
                  <Textarea
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[80px] bg-secondary border-border resize-none mb-2"
                    data-testid="comment-input"
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="w-full gap-2"
                    disabled={!commentText.trim() || addCommentMutation.isPending}
                    data-testid="submit-comment-btn"
                  >
                    <Send className="h-4 w-4" />
                    {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
                  </Button>
                </form>
              ) : (
                <div className="p-4 border-b border-border text-center">
                  <p className="text-foreground/50 text-sm mb-2">Sign in to comment</p>
                  <a href="/api/login">
                    <Button size="sm" variant="outline">Log In</Button>
                  </a>
                </div>
              )}

              <div className="max-h-[400px] overflow-y-auto">
                {commentsLoading ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-foreground/50 text-sm">No comments yet</p>
                    <p className="text-muted-foreground text-xs mt-1">Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {comments.map((comment, idx) => {
                      const commentUser = getUserForComment(comment.userId);
                      const isOwner = user?.id === comment.userId;
                      
                      return (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: idx * 0.05 }}
                          className="p-4 border-b border-border last:border-b-0 group"
                          data-testid={`comment-${comment.id}`}
                        >
                          <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0">
                              {commentUser?.profileImageUrl ? (
                                <img 
                                  src={commentUser.profileImageUrl} 
                                  alt="" 
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-4 w-4 text-foreground/60" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-foreground text-sm truncate">
                                  {commentUser?.firstName || "User"}
                                </span>
                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                  {formatTimeAgo(new Date(comment.createdAt))}
                                </span>
                              </div>
                              <p className="text-foreground/70 text-sm mt-1 break-words">
                                {comment.text}
                              </p>
                              {isOwner && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 mt-1 text-xs text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => deleteCommentMutation.mutate(comment.id)}
                                  data-testid={`delete-comment-${comment.id}`}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
