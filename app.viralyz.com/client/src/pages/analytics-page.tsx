import { motion } from "framer-motion";
import { 
  TrendingUp, BarChart3, Clock, Target, Zap, 
  Calendar, Users, Eye
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function AnalyticsPage() {
  const heatmapData = [
    { day: 'Mon', hours: [2,3,4,5,6,7,8,9,8,7,5,4,3,3,4,5,6,7,8,9,8,6,4,3] },
    { day: 'Tue', hours: [2,3,3,4,5,6,7,8,9,8,6,5,4,4,5,7,9,10,9,8,7,5,4,3] },
    { day: 'Wed', hours: [2,3,4,5,6,7,7,8,8,7,6,5,4,4,5,6,7,8,8,7,6,5,4,3] },
    { day: 'Thu', hours: [2,3,4,4,5,6,7,8,8,7,6,5,4,5,6,7,8,9,8,7,6,5,4,3] },
    { day: 'Fri', hours: [2,3,3,4,5,6,6,7,7,6,5,4,4,5,6,7,8,8,7,6,5,4,3,3] },
    { day: 'Sat', hours: [3,4,4,4,4,5,5,5,5,5,5,5,5,5,6,6,6,6,5,5,4,4,3,3] },
    { day: 'Sun', hours: [3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,4,4,3,3] },
  ];

  const getHeatColor = (value: number) => {
    if (value >= 9) return 'bg-emerald-500';
    if (value >= 7) return 'bg-emerald-600/80';
    if (value >= 5) return 'bg-indigo-500/60';
    if (value >= 3) return 'bg-slate-600';
    return 'bg-slate-700';
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
            <h1 className="text-3xl font-bold mb-2">Analytics</h1>
            <p className="text-slate-400">Last 30 days performance</p>
          </div>
          <select className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
          </select>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Content Analyzed', value: '47', change: '+12', icon: BarChart3, color: 'indigo' },
            { label: 'Avg Viral Score', value: '76', change: '+8', icon: Target, color: 'emerald' },
            { label: 'Prediction Accuracy', value: '82%', change: '+5%', icon: TrendingUp, color: 'purple' },
            { label: 'Total Views', value: '2.3M', change: '+340K', icon: Eye, color: 'pink' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-10 w-10 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
                </div>
                <span className="text-slate-400 text-sm">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{stat.value}</span>
                <span className="text-emerald-400 text-sm">{stat.change}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              Score Trend
            </h3>
            <div className="h-48 flex items-end justify-between gap-2">
              {[52, 58, 63, 59, 71, 68, 74, 79, 76, 82, 78, 85].map((score, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className={`w-full rounded-t-lg ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                    style={{ height: `${score}%` }}
                  />
                  <span className="text-xs text-slate-500">{i + 1}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-4 text-slate-400 text-sm">Week number</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-400" />
              Your Optimal Posting Times
            </h3>
            <div className="space-y-2">
              <div className="flex gap-1 text-xs text-slate-500 mb-2">
                <div className="w-10" />
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="flex-1 text-center">
                    {i % 4 === 0 ? `${i}` : ''}
                  </div>
                ))}
              </div>
              {heatmapData.map((row) => (
                <div key={row.day} className="flex gap-1 items-center">
                  <div className="w-10 text-xs text-slate-500">{row.day}</div>
                  {row.hours.map((value, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-5 rounded-sm ${getHeatColor(value)}`}
                      title={`${row.day} ${i}:00 - Engagement: ${value}`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-400">Best time: <span className="text-emerald-400 font-medium">Tuesday 6PM</span></span>
              <span className="text-slate-400">3.2x avg engagement</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            What's Working For You
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/30 rounded-xl p-4">
              <h4 className="text-slate-400 text-sm mb-3">Your best-performing hooks start with:</h4>
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span>Questions</span>
                  <span className="text-emerald-400">2.1x better</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>"I tried..."</span>
                  <span className="text-emerald-400">1.8x better</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Bold statements</span>
                  <span className="text-indigo-400">1.5x better</span>
                </li>
              </ul>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-4">
              <h4 className="text-slate-400 text-sm mb-3">Your optimal content length:</h4>
              <div className="text-4xl font-bold text-indigo-400 mb-2">45-60s</div>
              <p className="text-sm text-slate-400">Videos in this range get 2.3x more engagement</p>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-4">
              <h4 className="text-slate-400 text-sm mb-3">Your best thumbnail style:</h4>
              <div className="text-xl font-medium mb-2">Face + Large Text</div>
              <p className="text-sm text-slate-400">Thumbnails with faces get 40% more clicks</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            Prediction vs Reality
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: 'Accurate Predictions', value: '78%', desc: 'Predictions within 20% of actual' },
              { title: 'Overperformed', value: '15%', desc: 'Content that exceeded predictions' },
              { title: 'Underperformed', value: '7%', desc: 'Content below predictions' },
              { title: 'Model Confidence', value: 'High', desc: 'Based on 47 data points' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{item.value}</div>
                <div className="text-sm font-medium text-slate-300 mb-1">{item.title}</div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
