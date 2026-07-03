import { Shell } from "@/components/layout/Shell";
import { UploadCloud, FileVideo, Image as ImageIcon, Sparkles, Zap, Check, X, ExternalLink, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import { calculateViralyzScore } from "@/lib/viralyz-score";
import { ViralyzScoreCard } from "@/components/ViralyzScoreCard";

type UploadType = 'clip' | 'film' | 'still' | 'flash' | null;

const uploadTypes = [
  { 
    type: 'clip' as const, 
    icon: Sparkles, 
    title: 'Create Clip', 
    desc: 'Short, vertical video under 3 mins. Viral ready.',
    specs: '9:16 aspect ratio • Max 3 minutes • MP4, MOV',
    iconBg: 'bg-pink-500/20',
    iconColor: 'text-pink-400',
    iconHoverBg: 'group-hover:bg-pink-500',
    borderHover: 'hover:border-pink-500/50'
  },
  { 
    type: 'film' as const, 
    icon: FileVideo, 
    title: 'Upload Film', 
    desc: 'Long-form video up to 4 hours. 16:9 or any ratio.',
    specs: '16:9 aspect ratio • Up to 4 hours • MP4, MOV',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    iconHoverBg: 'group-hover:bg-blue-500',
    borderHover: 'hover:border-blue-500/50'
  },
  { 
    type: 'still' as const, 
    icon: ImageIcon, 
    title: 'Post Still', 
    desc: 'High-res photos or carousels. Showcase your art.',
    specs: 'Any aspect ratio • Up to 10 images • JPG, PNG',
    iconBg: 'bg-green-500/20',
    iconColor: 'text-green-400',
    iconHoverBg: 'group-hover:bg-green-500',
    borderHover: 'hover:border-green-500/50'
  },
  { 
    type: 'flash' as const, 
    icon: Zap, 
    title: 'Quick Flash', 
    desc: 'Ephemeral 24-hour content. Stories that disappear.',
    specs: '9:16 aspect ratio • Max 60 seconds • MP4, JPG',
    iconBg: 'bg-yellow-500/20',
    iconColor: 'text-yellow-400',
    iconHoverBg: 'group-hover:bg-yellow-500',
    borderHover: 'hover:border-yellow-500/50'
  },
];

const platforms = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    color: 'bg-red-500',
    hoverBorder: 'hover:border-red-500/50',
    activeBorder: 'border-red-500',
    activeBg: 'bg-red-500/20',
    formats: ['film', 'clip'],
    uploadUrl: 'https://studio.youtube.com/channel/upload',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: 'bg-black',
    hoverBorder: 'hover:border-white/50',
    activeBorder: 'border-white',
    activeBg: 'bg-white/20',
    formats: ['clip', 'flash'],
    uploadUrl: 'https://www.tiktok.com/upload',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    color: 'bg-gradient-to-br from-amber-500 to-pink-500',
    hoverBorder: 'hover:border-pink-500/50',
    activeBorder: 'border-pink-500',
    activeBg: 'bg-pink-500/20',
    formats: ['clip', 'still', 'flash'],
    uploadUrl: 'https://www.instagram.com/',
  },
  {
    id: 'twitch',
    name: 'Twitch',
    icon: '🎮',
    color: 'bg-amber-600',
    hoverBorder: 'hover:border-amber-500/50',
    activeBorder: 'border-amber-500',
    activeBg: 'bg-amber-500/20',
    formats: ['film', 'clip'],
    uploadUrl: 'https://dashboard.twitch.tv/content/video-producer',
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: '𝕏',
    color: 'bg-black',
    hoverBorder: 'hover:border-blue-400/50',
    activeBorder: 'border-blue-400',
    activeBg: 'bg-blue-400/20',
    formats: ['clip', 'still', 'flash'],
    uploadUrl: 'https://twitter.com/compose/tweet',
  },
];

export default function Upload() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { uploadFile, isUploading: isFileUploading } = useUpload({
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const initialType = urlParams.get('type') as UploadType;
  
  const [selectedType, setSelectedType] = useState<UploadType>(initialType);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedObjectPath, setUploadedObjectPath] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['viralyz']);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialType && ['clip', 'film', 'still', 'flash'].includes(initialType)) {
      setSelectedType(initialType);
    }
  }, [initialType]);

  const createContentMutation = useMutation({
    mutationFn: async (data: { type: string; title: string; description: string; userId: string; src: string; thumbnail?: string }) => {
      const response = await apiRequest('POST', '/api/content', data);
      return response.json();
    },
    onSuccess: () => {
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      toast({
        title: "Content published!",
        description: "Your content has been saved to Viralyz.",
      });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "There was an error publishing your content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      const result = await uploadFile(file);
      if (result) {
        setUploadedObjectPath(result.objectPath);
      }
    }
  };

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

  const togglePlatform = (platformId: string) => {
    if (platformId === 'viralyz') return;
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSubmit = () => {
    if (!user || !selectedType || !title) return;
    
    if (!uploadedObjectPath) {
      toast({
        title: "No file uploaded",
        description: "Please upload a file before publishing.",
        variant: "destructive",
      });
      return;
    }
    
    const mediaSrc = uploadedObjectPath;
    
    createContentMutation.mutate({
      type: selectedType,
      title: title,
      description: description,
      userId: user.id,
      src: mediaSrc,
      thumbnail: mediaSrc,
    });
  };

  const openPlatformUpload = (url: string) => {
    window.open(url, '_blank');
  };

  const resetForm = () => {
    setShowSuccess(false);
    setUploadedFile(null);
    setUploadedObjectPath(null);
    setSelectedType(null);
    setTitle("");
    setDescription("");
    setSelectedPlatforms(['viralyz']);
  };

  const selectedTypeInfo = uploadTypes.find(t => t.type === selectedType);
  const compatiblePlatforms = platforms.filter(p => 
    selectedType ? p.formats.includes(selectedType) : true
  );
  
  const isUploading = isFileUploading || createContentMutation.isPending;

  const viralyzScore = useMemo(() => {
    if (!selectedType || !title) return null;
    return calculateViralyzScore({
      title,
      description,
      type: selectedType,
      hasMedia: !!uploadedObjectPath,
      platforms: selectedPlatforms,
    });
  }, [title, description, selectedType, uploadedObjectPath, selectedPlatforms]);

  if (showSuccess) {
    return (
      <Shell>
        <div className="mx-auto max-w-3xl py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            <div className="h-24 w-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="h-12 w-12 text-green-500" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Published to Viralyz!</h1>
              <p className="text-muted-foreground">"{title}" is now live on your profile</p>
            </div>

            {selectedPlatforms.filter(p => p !== 'viralyz').length > 0 && (
              <div className="bg-card border border-white/10 rounded-2xl p-6 text-left">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Cross-post to selected platforms
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click each platform below to upload your content there too:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedPlatforms.filter(p => p !== 'viralyz').map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    if (!platform) return null;
                    return (
                      <button
                        key={platform.id}
                        onClick={() => openPlatformUpload(platform.uploadUrl)}
                        className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                        data-testid={`open-${platform.id}`}
                      >
                        <span className="text-2xl">{platform.icon}</span>
                        <div className="text-left">
                          <div className="font-medium text-white">{platform.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            Open upload <ExternalLink className="h-3 w-3" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={resetForm}
                className="px-8"
              >
                Create Another
              </Button>
              <Button onClick={() => window.location.href = '/profile'} className="px-8">
                View Profile
              </Button>
            </div>
          </motion.div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-3xl py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold font-display text-white mb-2">Create Content</h1>
          <p className="text-muted-foreground">Share your story with the world. One platform, all formats.</p>
        </div>

        <AnimatePresence mode="wait">
          {!selectedType ? (
            <motion.div
              key="type-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uploadTypes.map((item) => (
                  <motion.div
                    key={item.type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(item.type)}
                    className={`p-6 rounded-2xl bg-card border border-white/10 ${item.borderHover} transition-all cursor-pointer group`}
                    data-testid={`select-${item.type}`}
                  >
                    <div className={`h-12 w-12 rounded-xl ${item.iconBg} flex items-center justify-center ${item.iconColor} mb-4 ${item.iconHoverBg} group-hover:text-white transition-colors`}>
                      <item.icon size={24} />
                    </div>
                    <h4 className="font-bold text-white text-lg mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
                    <p className="text-xs text-white/40">{item.specs}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <button 
                onClick={() => { setSelectedType(null); setUploadedFile(null); setUploadedObjectPath(null); }}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
              >
                <X size={16} /> Back to content types
              </button>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  {selectedTypeInfo && <selectedTypeInfo.icon className="h-5 w-5 text-primary" />}
                </div>
                <div>
                  <h3 className="font-bold text-white">
                    {selectedTypeInfo?.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedTypeInfo?.specs}
                  </p>
                </div>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !isFileUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer ${
                  isDragging 
                    ? 'border-primary bg-primary/10' 
                    : uploadedObjectPath 
                      ? 'border-green-500/50 bg-green-500/5' 
                      : uploadedFile && isFileUploading
                        ? 'border-blue-500/50 bg-blue-500/5'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={selectedType === 'still' ? 'image/*' : 'video/*,image/*'}
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="file-input"
                />
                
                <div className="flex flex-col items-center gap-4 text-center">
                  {isFileUploading ? (
                    <>
                      <div className="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Uploading...</h3>
                        <p className="text-sm text-muted-foreground">
                          {uploadedFile?.name}
                        </p>
                      </div>
                    </>
                  ) : uploadedObjectPath ? (
                    <>
                      <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="h-8 w-8 text-green-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{uploadedFile?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {uploadedFile ? (uploadedFile.size / 1024 / 1024).toFixed(2) : 0} MB • Uploaded successfully
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                        <UploadCloud className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Drag & Drop or Click to Upload</h3>
                        <p className="text-sm text-muted-foreground">
                          Select a file from your device
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your content a catchy title..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    data-testid="input-title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Tell viewers what this is about..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    data-testid="input-description"
                  />
                </div>
              </div>

              {viralyzScore && (
                <ViralyzScoreCard score={viralyzScore} compact />
              )}

              <div className="bg-card border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Publish to Platforms
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select platforms to cross-post your content. Compatible platforms shown based on content type.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border-2 border-primary text-white transition-all"
                    data-testid="platform-viralyz"
                  >
                    <span className="text-lg">✦</span>
                    <span className="font-medium">Viralyz</span>
                    <Check className="h-4 w-4 ml-1" />
                  </button>
                  
                  {compatiblePlatforms.map(platform => {
                    const isSelected = selectedPlatforms.includes(platform.id);
                    return (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                          isSelected 
                            ? `${platform.activeBg} ${platform.activeBorder} text-white` 
                            : `bg-white/5 border-white/10 text-white/70 ${platform.hoverBorder}`
                        }`}
                        data-testid={`platform-${platform.id}`}
                      >
                        <span className="text-lg">{platform.icon}</span>
                        <span className="font-medium">{platform.name}</span>
                        {isSelected && <Check className="h-4 w-4 ml-1" />}
                      </button>
                    );
                  })}
                </div>
                
                <p className="text-xs text-white/40 mt-4">
                  External platforms will open in new tabs for you to complete the upload.
                </p>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleSubmit}
                  disabled={!title || isUploading}
                  className="flex-1 h-14 rounded-xl font-bold text-lg"
                  data-testid="submit-upload"
                >
                  {createContentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="mr-2 h-5 w-5" />
                      Publish {selectedType}
                      {selectedPlatforms.length > 1 && ` to ${selectedPlatforms.length} platforms`}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Shell>
  );
}
