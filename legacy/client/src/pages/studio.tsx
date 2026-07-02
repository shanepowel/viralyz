import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import { calculateViralyzScore } from "@/lib/viralyz-score";
import { ViralyzScoreCard } from "@/components/ViralyzScoreCard";
import {
  UploadCloud,
  FileVideo,
  Image as ImageIcon,
  Sparkles,
  Zap,
  Check,
  ChevronRight,
  ChevronLeft,
  Share2,
  Loader2,
  Wand2,
  BarChart3,
  Send,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  Hash
} from "lucide-react";

type ContentType = 'clip' | 'film' | 'still' | 'flash';
type StudioStep = 'upload' | 'analyze' | 'optimize' | 'publish';

const contentTypes = [
  { type: 'clip' as const, icon: Sparkles, title: 'Clip', desc: 'Short vertical video', color: 'pink' },
  { type: 'film' as const, icon: FileVideo, title: 'Film', desc: 'Long-form video', color: 'blue' },
  { type: 'still' as const, icon: ImageIcon, title: 'Still', desc: 'Photo or image', color: 'green' },
  { type: 'flash' as const, icon: Zap, title: 'Flash', desc: '24h story', color: 'yellow' },
];

const platforms = [
  { id: 'youtube', name: 'YouTube', icon: '▶️', url: 'https://studio.youtube.com/channel/upload' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', url: 'https://www.tiktok.com/upload' },
  { id: 'instagram', name: 'Instagram', icon: '📸', url: 'https://www.instagram.com/' },
  { id: 'twitch', name: 'Twitch', icon: '🎮', url: 'https://dashboard.twitch.tv/content/video-producer' },
  { id: 'twitter', name: 'Twitter/X', icon: '𝕏', url: 'https://twitter.com/compose/tweet' },
];

const POWER_WORD_SUGGESTIONS = [
  'Ultimate', 'Secret', 'Exclusive', 'Amazing', 'Epic', 'Insane',
  'Game-Changing', 'Revolutionary', 'Must-See', 'Revealed', 'Proven'
];

const HOOK_SUGGESTIONS = [
  'How to...', 'Why you should...', 'The secret to...', 
  'What nobody tells you about...', '5 ways to...', 'Stop doing this...'
];

const HASHTAG_SUGGESTIONS = [
  '#viral', '#trending', '#fyp', '#foryou', '#explore',
  '#content', '#creator', '#tips', '#howto', '#tutorial'
];

export default function Studio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<StudioStep>('upload');
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedObjectPath, setUploadedObjectPath] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);

  const { uploadFile, isUploading } = useUpload({
    onError: (error) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });

  const createContentMutation = useMutation({
    mutationFn: async (data: { type: string; title: string; description: string; userId: string; src: string; thumbnail?: string }) => {
      const response = await apiRequest('POST', '/api/content', data);
      return response.json();
    },
    onSuccess: () => {
      setIsPublished(true);
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      toast({ title: "Published to Viralyz!" });
    },
    onError: () => {
      toast({ title: "Failed to publish", variant: "destructive" });
    },
  });

  const viralyzScore = useMemo(() => {
    if (!contentType || !title) return null;
    return calculateViralyzScore({
      title,
      description,
      type: contentType,
      hasMedia: !!uploadedObjectPath,
      platforms: ['viralyz', ...selectedPlatforms],
    });
  }, [title, description, contentType, uploadedObjectPath, selectedPlatforms]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const result = await uploadFile(file);
      if (result) {
        setUploadedObjectPath(result.objectPath);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      const result = await uploadFile(file);
      if (result) {
        setUploadedObjectPath(result.objectPath);
      }
    }
  };

  const applyOptimization = (type: 'power_word' | 'hook' | 'hashtag', value: string) => {
    if (type === 'power_word') {
      setTitle(prev => `${value} ${prev}`);
    } else if (type === 'hook') {
      setTitle(value);
    } else if (type === 'hashtag') {
      setDescription(prev => `${prev} ${value}`);
    }
    toast({ title: "Optimization applied!" });
  };

  const handlePublish = () => {
    if (!user || !contentType || !title || !uploadedObjectPath) return;
    createContentMutation.mutate({
      type: contentType,
      title,
      description,
      userId: user.id,
      src: uploadedObjectPath,
      thumbnail: uploadedObjectPath,
    });
  };

  const canProceed = () => {
    const hasBasics = contentType && uploadedObjectPath && title;
    switch (step) {
      case 'upload': return hasBasics;
      case 'analyze': return hasBasics;
      case 'optimize': return hasBasics;
      case 'publish': return hasBasics;
      default: return false;
    }
  };

  const canNavigateToStep = (targetIndex: number) => {
    if (targetIndex === 0) return true;
    const hasBasics = contentType && uploadedObjectPath && title;
    return hasBasics && targetIndex <= currentStepIndex + 1;
  };

  const steps: { id: StudioStep; label: string; icon: typeof UploadCloud }[] = [
    { id: 'upload', label: 'Upload', icon: UploadCloud },
    { id: 'analyze', label: 'Analyze', icon: BarChart3 },
    { id: 'optimize', label: 'Optimize', icon: Wand2 },
    { id: 'publish', label: 'Publish', icon: Send },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) setStep(steps[nextIndex].id);
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) setStep(steps[prevIndex].id);
  };

  if (isPublished) {
    return (
      <Shell>
        <div className="mx-auto max-w-3xl py-16">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8">
            <div className="h-24 w-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Published to Viralyz!</h1>
              <p className="text-muted-foreground">"{title}" is now live</p>
              {viralyzScore && (
                <p className="text-primary font-bold mt-2">Viralyz Score: {viralyzScore.overall}/100</p>
              )}
            </div>

            {selectedPlatforms.length > 0 && (
              <div className="bg-card border border-white/10 rounded-2xl p-6 text-left">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Share2 className="h-5 w-5" /> Cross-post to platforms
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedPlatforms.map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    if (!platform) return null;
                    return (
                      <button
                        key={platform.id}
                        onClick={() => window.open(platform.url, '_blank')}
                        className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                        data-testid={`crosspost-${platform.id}`}
                      >
                        <span className="text-2xl">{platform.icon}</span>
                        <div className="text-left">
                          <div className="font-medium text-white">{platform.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            Open <ExternalLink className="h-3 w-3" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => window.location.reload()}>Create Another</Button>
              <Button onClick={() => window.location.href = '/profile'}>View Profile</Button>
            </div>
          </motion.div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-4xl py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold font-display text-white mb-2">Content Studio</h1>
          <p className="text-muted-foreground">Create, analyze, optimize, and publish—all in one place</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-primary to-accent -translate-y-1/2 transition-all duration-500"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
            {steps.map((s, i) => {
              const isActive = i === currentStepIndex;
              const isComplete = i < currentStepIndex;
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => canNavigateToStep(i) && setStep(s.id)}
                  className={`relative z-10 flex flex-col items-center gap-2 transition-all ${
                    canNavigateToStep(i) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                  data-testid={`step-${s.id}`}
                >
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                    isActive ? 'bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30' :
                    isComplete ? 'bg-green-500' : 'bg-white/10'
                  }`}>
                    {isComplete ? <Check className="h-5 w-5 text-white" /> : <Icon className="h-5 w-5 text-white" />}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {contentTypes.map(ct => (
                  <button
                    key={ct.type}
                    onClick={() => setContentType(ct.type)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      contentType === ct.type 
                        ? 'border-primary bg-primary/10' 
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                    data-testid={`type-${ct.type}`}
                  >
                    <ct.icon className={`h-6 w-6 mx-auto mb-2 ${contentType === ct.type ? 'text-primary' : 'text-white/60'}`} />
                    <div className="font-medium text-white text-sm">{ct.title}</div>
                    <div className="text-xs text-muted-foreground">{ct.desc}</div>
                  </button>
                ))}
              </div>

              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer ${
                  uploadedObjectPath ? 'border-green-500/50 bg-green-500/5' :
                  isUploading ? 'border-blue-500/50 bg-blue-500/5' :
                  'border-white/10 bg-white/5 hover:border-primary/50'
                }`}
              >
                <input ref={fileInputRef} type="file" accept="video/*,image/*" onChange={handleFileSelect} className="hidden" data-testid="file-input" />
                <div className="flex flex-col items-center gap-3 text-center">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                      <p className="text-white font-medium">Uploading...</p>
                    </>
                  ) : uploadedObjectPath ? (
                    <>
                      <Check className="h-10 w-10 text-green-500" />
                      <p className="text-white font-medium">{uploadedFile?.name}</p>
                      <p className="text-xs text-muted-foreground">Click to change file</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-10 w-10 text-white/40" />
                      <p className="text-white font-medium">Drop file or click to upload</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Give your content a catchy title..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none"
                  data-testid="input-title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Tell viewers what this is about..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none resize-none"
                  data-testid="input-description"
                />
              </div>
            </motion.div>
          )}

          {step === 'analyze' && (
            <motion.div
              key="analyze"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <h3 className="font-bold text-white mb-3">Content Preview</h3>
                    {uploadedFile && (
                      <div className="aspect-video rounded-xl bg-black/50 overflow-hidden">
                        {uploadedFile.type.startsWith('video/') ? (
                          <video src={URL.createObjectURL(uploadedFile)} className="w-full h-full object-cover" controls />
                        ) : (
                          <img src={URL.createObjectURL(uploadedFile)} className="w-full h-full object-cover" alt="Preview" />
                        )}
                      </div>
                    )}
                    <div className="mt-3">
                      <h4 className="font-medium text-white">{title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
                    </div>
                  </div>
                </div>

                <div>
                  {viralyzScore ? (
                    <ViralyzScoreCard score={viralyzScore} />
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                      <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                      <p className="text-white font-medium">Add a title to see your score</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'optimize' && (
            <motion.div
              key="optimize"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Power Words</h3>
                    <p className="text-xs text-muted-foreground">Add attention-grabbing words to your title</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POWER_WORD_SUGGESTIONS.map(word => (
                    <button
                      key={word}
                      onClick={() => applyOptimization('power_word', word)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:bg-primary/20 hover:border-primary/50 transition-all"
                      data-testid={`power-word-${word.toLowerCase()}`}
                    >
                      + {word}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Hook Templates</h3>
                    <p className="text-xs text-muted-foreground">Use proven hooks that drive clicks</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {HOOK_SUGGESTIONS.map(hook => (
                    <button
                      key={hook}
                      onClick={() => applyOptimization('hook', hook)}
                      className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white text-left hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all"
                      data-testid={`hook-${hook.substring(0, 10).toLowerCase().replace(/\s/g, '-')}`}
                    >
                      {hook}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Hash className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Trending Hashtags</h3>
                    <p className="text-xs text-muted-foreground">Add to description for discoverability</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {HASHTAG_SUGGESTIONS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => applyOptimization('hashtag', tag)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:bg-purple-500/20 hover:border-purple-500/50 transition-all"
                      data-testid={`hashtag-${tag.substring(1)}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h4 className="font-medium text-white mb-2">Current Title</h4>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none"
                />
                <h4 className="font-medium text-white mt-4 mb-2">Current Description</h4>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none resize-none"
                />
              </div>

              {viralyzScore && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Updated Score</span>
                    <span className="text-2xl font-bold text-white">{viralyzScore.overall}/100</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 'publish' && (
            <motion.div
              key="publish"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Share2 className="h-5 w-5" /> Select Platforms
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Choose where to publish your content</p>
                
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-primary/20 border-2 border-primary flex items-center gap-3">
                    <span className="text-xl">✦</span>
                    <span className="font-medium text-white flex-1">Viralyz</span>
                    <Check className="h-5 w-5 text-primary" />
                  </div>

                  {platforms.map(platform => {
                    const isSelected = selectedPlatforms.includes(platform.id);
                    return (
                      <button
                        key={platform.id}
                        onClick={() => setSelectedPlatforms(prev => 
                          prev.includes(platform.id) ? prev.filter(p => p !== platform.id) : [...prev, platform.id]
                        )}
                        className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                          isSelected ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                        data-testid={`platform-${platform.id}`}
                      >
                        <span className="text-xl">{platform.icon}</span>
                        <span className="font-medium text-white flex-1 text-left">{platform.name}</span>
                        {isSelected && <Check className="h-5 w-5 text-green-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(!contentType || !uploadedObjectPath || !title) && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-400">Missing requirements</p>
                    <ul className="text-sm text-red-400/80 mt-1 space-y-1">
                      {!contentType && <li>• Select a content type</li>}
                      {!uploadedObjectPath && <li>• Upload a file</li>}
                      {!title && <li>• Add a title</li>}
                    </ul>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="font-bold text-white mb-4">Final Preview</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span className={contentType ? "text-white capitalize" : "text-red-400"}>{contentType || 'Not selected'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">Title:</span>
                    <span className={title ? "text-white" : "text-red-400"}>{title || 'Not set'}</span>
                  </div>
                  {viralyzScore && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">Score:</span>
                      <span className="text-primary font-bold">{viralyzScore.overall}/100 ({viralyzScore.grade})</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">Platforms:</span>
                    <span className="text-white">Viralyz{selectedPlatforms.length > 0 ? ` + ${selectedPlatforms.length} more` : ''}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={currentStepIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>

          {step === 'publish' ? (
            <Button
              onClick={handlePublish}
              disabled={!canProceed() || createContentMutation.isPending}
              className="gap-2 px-8"
              data-testid="btn-publish"
            >
              {createContentMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Publishing...</>
              ) : (
                <><Send className="h-4 w-4" /> Publish Now</>
              )}
            </Button>
          ) : (
            <Button
              onClick={goNext}
              disabled={!canProceed()}
              className="gap-2"
              data-testid="btn-next"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Shell>
  );
}
