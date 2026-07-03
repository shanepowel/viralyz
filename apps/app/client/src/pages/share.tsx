import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Lock, Eye, Target, Zap, Clock, Hash, BarChart3, 
  CheckCircle2, XCircle, AlertCircle, ArrowLeft, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface AnalysisData {
  id: string;
  title: string;
  description: string;
  platform: string;
  viralScore: number;
  hookScore: number;
  hookAnalysis: string;
  visualScore: number;
  visualAnalysis: string;
  structureScore: number;
  structureAnalysis: string;
  metadataScore: number;
  metadataAnalysis: string;
  timingScore: number;
  optimalPostingTime: string;
  createdAt: string;
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  return "text-red-500";
}

function getScoreBg(score: number) {
  if (score >= 80) return "bg-green-500/20";
  if (score >= 60) return "bg-yellow-500/20";
  return "bg-red-500/20";
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#scoreGradient)"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{score}</span>
        <span className="text-xs text-muted-foreground">Viral Score</span>
      </div>
    </div>
  );
}

export default function SharePage() {
  const [, params] = useRoute("/share/:code");
  const code = params?.code;
  
  const [loading, setLoading] = useState(true);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  
  const { toast } = useToast();

  useEffect(() => {
    if (!code) return;
    
    fetch(`/api/public/share/${code}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load shared content");
        }
        return res.json();
      })
      .then((data) => {
        if (data.requiresPassword) {
          setRequiresPassword(true);
          setTitle(data.title);
        } else {
          setAnalysis(data.analysis);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [code]);

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    
    setVerifying(true);
    try {
      const res = await fetch(`/api/public/share/${code}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Verification failed");
      }
      
      const data = await res.json();
      setAnalysis(data.analysis);
      setRequiresPassword(false);
    } catch (err: any) {
      toast({
        title: "Access Denied",
        description: err.message || "Incorrect password",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900/20 to-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900/20 to-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Link Not Found</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Viralyz
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900/20 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <Lock className="h-12 w-12 text-amber-500 mx-auto mb-2" />
              <CardTitle>Password Protected</CardTitle>
              <p className="text-sm text-muted-foreground">
                This analysis requires a password to view
              </p>
              {title && (
                <p className="text-sm font-medium mt-2">"{title}"</p>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyPassword} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-share-password"
                />
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-amber-600 to-pink-600"
                  disabled={verifying || !password.trim()}
                  data-testid="button-verify-password"
                >
                  {verifying ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Lock className="h-4 w-4 mr-2" />
                  )}
                  Unlock Content
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const scoreMetrics = [
    { label: "Hook", score: analysis.hookScore, icon: Target, analysis: analysis.hookAnalysis },
    { label: "Visual", score: analysis.visualScore, icon: Eye, analysis: analysis.visualAnalysis },
    { label: "Structure", score: analysis.structureScore, icon: BarChart3, analysis: analysis.structureAnalysis },
    { label: "Metadata", score: analysis.metadataScore, icon: Hash, analysis: analysis.metadataAnalysis },
    { label: "Timing", score: analysis.timingScore, icon: Clock, analysis: analysis.optimalPostingTime },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900/20 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Zap className="h-4 w-4 text-amber-500" />
                Viralyz Analysis
              </div>
              <h1 className="text-2xl font-bold">{analysis.title || "Content Analysis"}</h1>
              <p className="text-sm text-muted-foreground capitalize">{analysis.platform}</p>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                Try Viralyz Free
              </Button>
            </Link>
          </div>

          <Card className="border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <ScoreRing score={analysis.viralScore} size={140} />
                <div className="flex-1 grid grid-cols-5 gap-2">
                  {scoreMetrics.map((metric) => (
                    <div 
                      key={metric.label}
                      className="text-center p-3 rounded-lg bg-muted/30"
                    >
                      <metric.icon className={`h-5 w-5 mx-auto mb-1 ${getScoreColor(metric.score)}`} />
                      <div className={`text-lg font-bold ${getScoreColor(metric.score)}`}>
                        {metric.score}
                      </div>
                      <div className="text-xs text-muted-foreground">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {scoreMetrics.map((metric) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div className={`p-1.5 rounded ${getScoreBg(metric.score)}`}>
                        <metric.icon className={`h-4 w-4 ${getScoreColor(metric.score)}`} />
                      </div>
                      {metric.label} Analysis
                      <span className={`ml-auto font-bold ${getScoreColor(metric.score)}`}>
                        {metric.score}/100
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{metric.analysis}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center py-8 border-t border-border/50">
            <p className="text-muted-foreground mb-4">
              Want to analyze your own content?
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-amber-600 to-pink-600">
                <Zap className="h-4 w-4 mr-2" />
                Get Started with Viralyz
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
