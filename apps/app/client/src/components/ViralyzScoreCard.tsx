import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, FileText, AlignLeft, LayoutGrid, Zap, Users, Share2, Sparkles, HelpCircle } from "lucide-react";
import { ViralyzScore, ScoreFactor } from "@/lib/viralyz-score";

interface ViralyzScoreCardProps {
  score: ViralyzScore;
  compact?: boolean;
}

const iconMap = {
  title: FileText,
  description: AlignLeft,
  format: LayoutGrid,
  timing: Zap,
  engagement: Users,
  platform: Share2,
};

const gradeColors = {
  S: 'from-yellow-400 to-orange-500',
  A: 'from-green-400 to-emerald-500',
  B: 'from-blue-400 to-cyan-500',
  C: 'from-purple-400 to-violet-500',
  D: 'from-orange-400 to-red-400',
  F: 'from-red-500 to-red-700',
};

const gradeDescriptions = {
  S: 'Viral Ready',
  A: 'Excellent',
  B: 'Good',
  C: 'Average',
  D: 'Needs Work',
  F: 'Poor',
};

export function ViralyzScoreCard({ score, compact = false }: ViralyzScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null);

  const toggleFactor = (name: string) => {
    setExpandedFactor(expandedFactor === name ? null : name);
  };

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        data-testid="viralyz-score-toggle"
      >
        <div className="flex items-center gap-4">
          <div className={`relative h-16 w-16 rounded-xl bg-gradient-to-br ${gradeColors[score.grade]} flex items-center justify-center shadow-lg`}>
            <span className="text-2xl font-black text-white">{score.grade}</span>
            <div className="absolute -top-1 -right-1 bg-background rounded-full p-0.5">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
          </div>
          
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{score.overall}</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium bg-gradient-to-r ${gradeColors[score.grade]} bg-clip-text text-transparent`}>
                {gradeDescriptions[score.grade]}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                Why this score?
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-muted-foreground">{score.summary}</p>
              </div>

              <div className="space-y-2">
                {score.factors.map((factor) => (
                  <FactorRow
                    key={factor.name}
                    factor={factor}
                    isExpanded={expandedFactor === factor.name}
                    onToggle={() => toggleFactor(factor.name)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FactorRowProps {
  factor: ScoreFactor;
  isExpanded: boolean;
  onToggle: () => void;
}

function FactorRow({ factor, isExpanded, onToggle }: FactorRowProps) {
  const Icon = iconMap[factor.icon] || FileText;
  const percentage = Math.round((factor.score / factor.maxScore) * 100);
  
  const getBarColor = () => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center gap-3 hover:bg-white/5 transition-colors"
        data-testid={`factor-${factor.name.toLowerCase().replace(/\s/g, '-')}`}
      >
        <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
          <Icon className="h-4 w-4 text-white/70" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-white">{factor.name}</span>
            <span className="text-sm text-muted-foreground">
              {factor.score}/{factor.maxScore}
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`h-full ${getBarColor()} rounded-full`}
            />
          </div>
        </div>

        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 space-y-2">
              <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-xs text-green-400">{factor.explanation}</p>
              </div>
              
              {factor.recommendation && (
                <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-3 w-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-yellow-400">{factor.recommendation}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
