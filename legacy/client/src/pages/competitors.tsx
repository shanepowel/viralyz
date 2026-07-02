import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, Users, TrendingUp, Eye, Sparkles, 
  ExternalLink, BarChart3, Zap, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Competitor {
  id: string;
  username: string;
  platform: string;
  followers: string;
  avgViews: string;
  topContent: { title: string; views: string; score: number }[];
}

const mockCompetitors: Competitor[] = [
  {
    id: '1',
    username: '@techreviewpro',
    platform: 'YouTube',
    followers: '1.2M',
    avgViews: '250K',
    topContent: [
      { title: "iPhone 15 Pro - The TRUTH After 30 Days", views: "2.1M", score: 94 },
      { title: "Why I'm Switching to Android", views: "890K", score: 88 },
      { title: "Best Tech Under $50", views: "567K", score: 82 },
    ]
  },
  {
    id: '2',
    username: '@dailytech',
    platform: 'TikTok',
    followers: '890K',
    avgViews: '180K',
    topContent: [
      { title: "This $10 gadget changed my life", views: "4.2M", score: 96 },
      { title: "POV: You just discovered this hack", views: "1.8M", score: 91 },
      { title: "Stop buying expensive cables", views: "920K", score: 85 },
    ]
  },
];

const trendingHooks = [
  { text: "I can't believe I'm sharing this...", change: "+340%" },
  { text: "Stop scrolling if you...", change: "+280%" },
  { text: "POV: You just discovered...", change: "+190%" },
  { text: "Nobody talks about this...", change: "+165%" },
];

const trendingFormats = [
  { text: "Split-screen reactions", change: "+220%" },
  { text: "Day in my life with text overlays", change: "+180%" },
  { text: "Before/After transformations", change: "+145%" },
];

export default function Competitors() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState({ username: '', platform: 'youtube' });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-indigo-400";
    if (score >= 40) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Competitor Intelligence</h1>
            <p className="text-slate-400">Track what's working in your niche</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700" data-testid="button-add-competitor">
                <Plus className="h-4 w-4 mr-2" />
                Add Competitor
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle>Add Competitor</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Track a competitor's content to see what's working in your niche.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Username or URL</label>
                  <input
                    type="text"
                    value={newCompetitor.username}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, username: e.target.value })}
                    placeholder="@username or channel URL"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder:text-slate-500"
                    data-testid="competitor-username-input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Platform</label>
                  <select
                    value={newCompetitor.platform}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, platform: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white"
                    data-testid="competitor-platform-select"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="twitter">Twitter</option>
                  </select>
                </div>
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setShowAddDialog(false)}
                  data-testid="button-add-competitor-submit"
                >
                  Add Competitor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4">Your Tracked Competitors</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {mockCompetitors.map((competitor) => (
              <div 
                key={competitor.id}
                className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 hover:border-indigo-500/30 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg">
                    {competitor.username[1].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{competitor.username}</div>
                    <div className="text-sm text-slate-400">{competitor.platform}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-slate-400">Followers: </span>
                    <span className="text-white font-medium">{competitor.followers}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Avg Views: </span>
                    <span className="text-white font-medium">{competitor.avgViews}</span>
                  </div>
                </div>
              </div>
            ))}
            <div 
              className="bg-slate-800/20 rounded-xl p-4 border-2 border-dashed border-slate-700 flex items-center justify-center cursor-pointer hover:border-indigo-500/50 transition-colors"
              onClick={() => setShowAddDialog(true)}
            >
              <div className="text-center">
                <Plus className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                <span className="text-slate-400 text-sm">Add Competitor</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-pink-400" />
            <h3 className="font-semibold">Trending In Your Niche (Last 7 days)</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockCompetitors.flatMap(c => c.topContent.map((content, i) => ({
              ...content,
              competitor: c.username,
              platform: c.platform
            }))).slice(0, 6).map((content, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="bg-slate-800/30 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{content.title}</h4>
                    <p className="text-xs text-slate-400">{content.competitor}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${getScoreColor(content.score)} bg-slate-700/50`}>
                    {content.score}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{content.views} views</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-400 hover:text-white">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Analyze
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-amber-400" />
              <h3 className="font-semibold">Trending Hooks</h3>
            </div>
            <ul className="space-y-3">
              {trendingHooks.map((hook, i) => (
                <li key={i} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                  <span className="text-slate-300">"{hook.text}"</span>
                  <span className="text-emerald-400 text-sm font-medium">{hook.change}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              <h3 className="font-semibold">Trending Formats</h3>
            </div>
            <ul className="space-y-3">
              {trendingFormats.map((format, i) => (
                <li key={i} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                  <span className="text-slate-300">{format.text}</span>
                  <span className="text-emerald-400 text-sm font-medium">{format.change}</span>
                </li>
              ))}
            </ul>
            <Button variant="ghost" className="w-full mt-4 text-slate-400 hover:text-white">
              See Full Trends Report
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
