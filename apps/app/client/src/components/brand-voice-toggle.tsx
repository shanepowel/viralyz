import { useQuery } from "@tanstack/react-query";
import { Mic2 } from "lucide-react";
import { Link } from "wouter";
import { Switch } from "@/components/ui/switch";

interface BrandVoiceProfile {
  id: string;
  name: string;
  isDefault: boolean;
}

interface BrandVoiceToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function BrandVoiceToggle({ enabled, onChange }: BrandVoiceToggleProps) {
  const { data: profiles } = useQuery<BrandVoiceProfile[]>({
    queryKey: ["/api/brand-voice"],
    queryFn: async () => {
      const res = await fetch("/api/brand-voice");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const defaultProfile = profiles?.find((p) => p.isDefault) || profiles?.[0];
  const hasProfile = !!defaultProfile;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-8 w-8 rounded-lg bg-purple-500/15 text-purple-700 flex items-center justify-center shrink-0">
          <Mic2 className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">Use my brand voice</div>
          {hasProfile ? (
            <div className="text-meta truncate">Apply "{defaultProfile.name}" tone profile</div>
          ) : (
            <div className="text-meta">
              No profile yet —{" "}
              <Link href="/brand-voice" className="text-purple-700 hover:text-purple-800 underline">
                train one
              </Link>
            </div>
          )}
        </div>
      </div>
      <Switch
        checked={enabled && hasProfile}
        onCheckedChange={(v) => onChange(v)}
        disabled={!hasProfile}
        data-testid="switch-brand-voice"
      />
    </div>
  );
}
