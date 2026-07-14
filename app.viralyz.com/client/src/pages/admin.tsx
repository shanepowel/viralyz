import { Shell } from "@/components/layout/Shell";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  FileVideo,
  MessageCircle,
  Users2,
  Shield,
  ShieldCheck,
  Trash2,
  MoreVertical,
  Search,
  ChevronDown,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { User, Content } from "@shared/schema";

interface AdminStats {
  totalUsers: number;
  totalContent: number;
  totalComments: number;
  totalTribes: number;
}

type TabType = 'overview' | 'users' | 'content';

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ type: 'user' | 'content'; id: string; name: string } | null>(null);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: activeTab === 'users' || activeTab === 'overview',
  });

  const { data: contentList = [], isLoading: contentLoading, refetch: refetchContent } = useQuery<Content[]>({
    queryKey: ['/api/admin/content'],
    enabled: activeTab === 'content',
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return apiRequest('PATCH', `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "User role updated" });
    },
    onError: () => {
      toast({ title: "Failed to update role", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest('DELETE', `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ title: "User deleted" });
      setDeleteDialog(null);
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (contentId: string) => {
      return apiRequest('DELETE', `/api/admin/content/${contentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ title: "Content deleted" });
      setDeleteDialog(null);
    },
    onError: () => {
      toast({ title: "Failed to delete content", variant: "destructive" });
    },
  });

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContent = contentList.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = () => {
    refetchStats();
    refetchUsers();
    refetchContent();
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'content' as const, label: 'Content', icon: FileVideo },
  ];

  return (
    <Shell>
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Manage users, content, and platform settings</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-white' 
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={Users}
                  label="Total Users"
                  value={stats?.totalUsers || 0}
                  color="blue"
                  loading={statsLoading}
                />
                <StatCard
                  icon={FileVideo}
                  label="Total Content"
                  value={stats?.totalContent || 0}
                  color="pink"
                  loading={statsLoading}
                />
                <StatCard
                  icon={MessageCircle}
                  label="Total Comments"
                  value={stats?.totalComments || 0}
                  color="green"
                  loading={statsLoading}
                />
                <StatCard
                  icon={Users2}
                  label="Total Tribes"
                  value={stats?.totalTribes || 0}
                  color="purple"
                  loading={statsLoading}
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Recent Users
                </h2>
                <div className="space-y-3">
                  {usersLoading ? (
                    <div className="text-muted-foreground">Loading...</div>
                  ) : users.slice(0, 5).map(u => (
                    <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                      {u.profileImageUrl ? (
                        <img src={u.profileImageUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-white">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/60'
                      }`}>
                        {u.role || 'user'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none"
                    data-testid="search-users"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground">Loading...</td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground">No users found</td>
                      </tr>
                    ) : filteredUsers.map(u => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {u.profileImageUrl ? (
                              <img src={u.profileImageUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <Users className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            <span className="font-medium text-white">{u.firstName} {u.lastName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/60'
                              }`}>
                                {u.role === 'admin' ? <ShieldCheck className="h-3 w-3" /> : null}
                                {u.role || 'user'}
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ userId: u.id, role: 'user' })}>
                                User
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ userId: u.id, role: 'admin' })}>
                                Admin
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 hover:bg-white/10 rounded-lg">
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => setDeleteDialog({ type: 'user', id: u.id, name: u.email || u.firstName || 'User' })}
                                className="text-red-400"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search content..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none"
                    data-testid="search-content"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contentLoading ? (
                  <div className="col-span-full text-center text-muted-foreground p-8">Loading...</div>
                ) : filteredContent.length === 0 ? (
                  <div className="col-span-full text-center text-muted-foreground p-8">No content found</div>
                ) : filteredContent.map(c => (
                  <div key={c.id} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                    {c.thumbnail && (
                      <div className="aspect-video bg-black/50">
                        <img src={c.thumbnail} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-white line-clamp-1">{c.title || 'Untitled'}</h3>
                          <p className="text-xs text-muted-foreground capitalize">{c.type}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 hover:bg-white/10 rounded-lg">
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => setDeleteDialog({ type: 'content', id: c.id, name: c.title || 'Content' })}
                              className="text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{c.views.toLocaleString()} views</span>
                        <span>{c.likes.toLocaleString()} likes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteDialog?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  if (deleteDialog?.type === 'user') {
                    deleteUserMutation.mutate(deleteDialog.id);
                  } else if (deleteDialog?.type === 'content') {
                    deleteContentMutation.mutate(deleteDialog.id);
                  }
                }}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Shell>
  );
}

interface StatCardProps {
  icon: typeof Users;
  label: string;
  value: number;
  color: 'blue' | 'pink' | 'green' | 'purple';
  loading?: boolean;
}

function StatCard({ icon: Icon, label, value, color, loading }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
    pink: 'from-pink-500/20 to-pink-500/5 border-pink-500/30',
    green: 'from-green-500/20 to-green-500/5 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
  };

  const iconColors = {
    blue: 'text-blue-400',
    pink: 'text-pink-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
  };

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${colorClasses[color]} border p-6`}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className={`h-6 w-6 ${iconColors[color]}`} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">
        {loading ? '...' : value.toLocaleString()}
      </p>
    </div>
  );
}
