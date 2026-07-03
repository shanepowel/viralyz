import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Copy, Check, Link2, Lock, Calendar, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
  analysisId: string;
  analysisTitle: string;
  trigger?: React.ReactNode;
}

export function ShareDialog({ analysisId, analysisTitle, trigger }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<string>("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const { toast } = useToast();

  const createShareMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          analysisId,
          password: usePassword ? password : undefined,
          expiresInDays: expiresInDays || undefined,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create share link");
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      const fullUrl = `${window.location.origin}${data.shareUrl}`;
      setShareUrl(fullUrl);
      toast({
        title: "Share link created!",
        description: "You can now share this analysis with others.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Share link copied to clipboard",
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setShareUrl(null);
      setPassword("");
      setUsePassword(false);
      setExpiresInDays("");
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" data-testid="button-share-analysis">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-amber-500" />
            Share Analysis
          </DialogTitle>
          <DialogDescription>
            Create a public link to share "{analysisTitle}" with others.
          </DialogDescription>
        </DialogHeader>

        {shareUrl ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1"
                data-testid="input-share-url"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleCopy}
                data-testid="button-copy-share-url"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {usePassword && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <Lock className="h-4 w-4" />
                <span>Password protected - share the password separately</span>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShareUrl(null)}
            >
              Create Another Link
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="password-toggle">Password protect</Label>
              </div>
              <Switch
                id="password-toggle"
                checked={usePassword}
                onCheckedChange={setUsePassword}
                data-testid="switch-password-protect"
              />
            </div>

            {usePassword && (
              <Input
                type="password"
                placeholder="Enter a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-share-password-create"
              />
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label>Link expiration</Label>
              </div>
              <Select value={expiresInDays} onValueChange={setExpiresInDays}>
                <SelectTrigger data-testid="select-expiration">
                  <SelectValue placeholder="Never expires" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Never expires</SelectItem>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-amber-600 to-pink-600"
              onClick={() => createShareMutation.mutate()}
              disabled={createShareMutation.isPending || (usePassword && !password.trim())}
              data-testid="button-create-share-link"
            >
              {createShareMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Create Share Link
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
