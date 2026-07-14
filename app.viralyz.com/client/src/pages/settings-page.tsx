import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, CreditCard, Bell, Link, Shield, LogOut,
  Check, ChevronRight, ExternalLink, Info, Clock, Mail
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import SubscriptionPayPal from "@/components/SubscriptionPayPal";
import { Linkedin, AlertCircle, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type ProviderId = "linkedin" | "x" | "threads" | "instagram";

const PROVIDER_META: Record<ProviderId, { label: string; envHint: string; iconBg: string; iconClass: string; buttonClass: string }> = {
  linkedin: {
    label: "LinkedIn",
    envHint: "LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET",
    iconBg: "bg-[#0077B5]/15",
    iconClass: "text-[#0A85C7]",
    buttonClass: "bg-[#0077B5] hover:bg-[#006399] text-white border-0",
  },
  x: {
    label: "X (Twitter)",
    envHint: "X_CLIENT_ID / X_CLIENT_SECRET",
    iconBg: "bg-black/30",
    iconClass: "text-slate-100",
    buttonClass: "bg-slate-900 hover:bg-black text-white border border-white/10",
  },
  threads: {
    label: "Threads",
    envHint: "THREADS_CLIENT_ID / THREADS_CLIENT_SECRET",
    iconBg: "bg-white/10",
    iconClass: "text-slate-100",
    buttonClass: "bg-slate-900 hover:bg-black text-white border border-white/10",
  },
  instagram: {
    label: "Instagram",
    envHint: "INSTAGRAM_CLIENT_ID / INSTAGRAM_CLIENT_SECRET",
    iconBg: "bg-gradient-to-br from-fuchsia-500/30 to-amber-500/30",
    iconClass: "text-fuchsia-200",
    buttonClass: "bg-gradient-to-r from-fuchsia-500 to-amber-500 hover:opacity-90 text-white border-0",
  },
};

function ConnectionSettingsRow({ provider }: { provider: ProviderId }) {
  const { data: status } = useQuery<{ configured: boolean; connected: boolean; profileName?: string | null; account: { displayName: string | null } | null }>({
    queryKey: [`/api/${provider}/status`],
  });
  const qc = useQueryClient();
  const disconnect = useMutation({
    mutationFn: async () => { await apiRequest("POST", `/api/${provider}/disconnect`, {}); },
    onSuccess: () => qc.invalidateQueries({ queryKey: [`/api/${provider}/status`] }),
  });
  const meta = PROVIDER_META[provider];
  if (!status) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center gap-3" data-testid={`${provider}-settings-row`}>
      <div className={`h-10 w-10 rounded-lg ${meta.iconBg} flex items-center justify-center`}>
        <Linkedin className={`h-5 w-5 ${meta.iconClass}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium">{meta.label}</div>
        {!status.configured ? (
          <div className="text-xs text-amber-300 inline-flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Not configured ({meta.envHint})</div>
        ) : status.connected ? (
          <div className="text-xs text-emerald-300 inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Connected as {status.profileName || status.account?.displayName || "you"}</div>
        ) : (
          <div className="text-xs text-slate-400">Not connected</div>
        )}
      </div>
      {status.connected ? (
        <Button size="sm" variant="ghost" className="text-rose-300 hover:text-rose-200" onClick={() => disconnect.mutate()} data-testid={`button-disconnect-${provider}-settings`}>
          Disconnect
        </Button>
      ) : status.configured ? (
        <Button size="sm" asChild className={meta.buttonClass} data-testid={`button-connect-${provider}-settings`}>
          <a href={`/api/${provider}/connect`}>Connect</a>
        </Button>
      ) : null}
    </div>
  );
}

function LinkedInSettingsRow() {
  return <ConnectionSettingsRow provider="linkedin" />;
}


const connectedPlatforms = [
  { name: 'YouTube', icon: '▶️', url: 'https://studio.youtube.com' },
  { name: 'TikTok', icon: '🎵', url: 'https://www.tiktok.com/creator-center' },
  { name: 'Instagram', icon: '📸', url: 'https://www.instagram.com' },
  { name: 'Twitter', icon: '𝕏', url: 'https://twitter.com' },
  { name: 'LinkedIn', icon: '💼', url: 'https://www.linkedin.com' },
];

const COMMON_TIMEZONES = [
  "America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York",
  "America/Sao_Paulo", "Europe/London", "Europe/Paris", "Europe/Berlin",
  "Europe/Madrid", "Africa/Cairo", "Asia/Dubai", "Asia/Kolkata",
  "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney", "UTC",
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPayPal, setShowPayPal] = useState<string | null>(null);

  const detectedTz = (() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return "UTC"; }
  })();
  const currentTz = user?.timezone || detectedTz;
  const tzOptions = Array.from(new Set([detectedTz, currentTz, ...COMMON_TIMEZONES]));

  const updateTz = async (tz: string) => {
    const res = await fetch("/api/user/timezone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ timezone: tz }),
    });
    if (res.ok) {
      toast({ title: "Timezone updated", description: tz });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } else {
      toast({ title: "Failed", description: "Could not update timezone", variant: "destructive" });
    }
  };

  const prefsQuery = useQuery<{ emailDigests: boolean }>({
    queryKey: ["/api/notification-prefs"],
  });
  const emailDigests = prefsQuery.data?.emailDigests ?? true;

  const updatePrefs = useMutation({
    mutationFn: async (next: boolean) => {
      const res = await fetch("/api/notification-prefs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ emailDigests: next }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: (_data, next) => {
      queryClient.setQueryData(["/api/notification-prefs"], { emailDigests: next });
      toast({
        title: next ? "Email digests on" : "Email digests off",
        description: next
          ? "You'll get a weekly recap by email."
          : "We'll stop sending weekly digests.",
      });
    },
    onError: () => {
      toast({ title: "Couldn't update preferences", description: "Try again in a moment." });
    },
  });

  const sendTestDigest = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/email/test-digest", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      const ok = data?.delivery?.ok;
      toast({
        title: ok ? "Test digest sent" : "Digest queued (not delivered)",
        description: ok
          ? "Check your inbox in a minute."
          : "No email provider is configured yet — set SENDGRID_API_KEY to deliver mail.",
      });
    },
    onError: () => {
      toast({ title: "Couldn't send test digest" });
    },
  });

  const userPlan = (user as any)?.plan || 'free';
  
  const plans = [
    {
      name: 'Free',
      price: '$0',
      amount: '0',
      features: ['10 analyses/month', '1 platform', 'Basic score'],
      current: userPlan === 'free',
    },
    {
      name: 'Pro',
      price: '$29',
      amount: '29.00',
      features: ['Unlimited analyses', 'All platforms', 'Full AI suggestions', 'Performance tracking'],
      current: userPlan === 'pro',
      popular: true,
    },
    {
      name: 'Team',
      price: '$99',
      amount: '99.00',
      features: ['Everything in Pro', '5 team members', 'Competitor tracking', 'API access'],
      current: userPlan === 'team',
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account and preferences</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <User className="h-5 w-5 text-indigo-400" />
            <h2 className="font-semibold">Profile</h2>
          </div>
          <div className="flex items-center gap-6">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="" 
                className="h-20 w-20 rounded-full"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl font-semibold">
                {user?.firstName?.[0] || 'U'}
              </div>
            )}
            <div className="flex-1">
              <div className="text-xl font-medium">{user?.firstName} {user?.lastName}</div>
              <div className="text-slate-400">{user?.email}</div>
              <div className="mt-2">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">
                  {(user as any)?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                </span>
              </div>
            </div>
            <Button variant="outline" className="border-slate-700" data-testid="button-edit-profile">
              Edit Profile
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="h-5 w-5 text-emerald-400" />
            <h2 className="font-semibold">Subscription & Credits</h2>
          </div>
          
          <div className="bg-slate-800/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400">Credits Remaining</span>
              <span className="text-2xl font-bold text-indigo-400">{(user as any)?.creditsRemaining ?? 10}</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                style={{ width: `${Math.min(100, ((user as any)?.creditsRemaining ?? 10) * 10)}%` }}
              />
            </div>
            <p className="text-sm text-slate-500 mt-2">Credits reset monthly on your billing date</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-4 border ${
                  plan.current 
                    ? 'border-indigo-500 bg-indigo-500/10' 
                    : plan.popular 
                    ? 'border-emerald-500/50 bg-slate-800/30' 
                    : 'border-slate-700 bg-slate-800/30'
                }`}
              >
                {plan.popular && (
                  <span className="text-xs text-emerald-400 font-medium">Most Popular</span>
                )}
                <div className="text-lg font-semibold mt-1">{plan.name}</div>
                <div className="text-2xl font-bold mb-3">{plan.price}<span className="text-sm text-slate-400">/mo</span></div>
                <ul className="space-y-2 text-sm text-slate-400 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.current ? (
                  <Button 
                    className="w-full bg-slate-700"
                    disabled
                    data-testid={`button-plan-${plan.name.toLowerCase()}`}
                  >
                    Current Plan
                  </Button>
                ) : plan.name === 'Free' ? (
                  <Button 
                    className="w-full bg-slate-700"
                    disabled
                    data-testid={`button-plan-${plan.name.toLowerCase()}`}
                  >
                    Free Plan
                  </Button>
                ) : showPayPal === plan.name ? (
                  <div className="space-y-2">
                    <SubscriptionPayPal 
                      planId={plan.name.toLowerCase() as "pro" | "team"}
                      onSuccess={() => setShowPayPal(null)}
                      onCancel={() => setShowPayPal(null)}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-slate-400"
                      onClick={() => setShowPayPal(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => {
                      setShowPayPal(plan.name);
                      toast({
                        title: "Upgrade with PayPal",
                        description: "Click the PayPal button to complete your purchase",
                      });
                    }}
                    data-testid={`button-plan-${plan.name.toLowerCase()}`}
                  >
                    Upgrade
                  </Button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Link className="h-5 w-5 text-purple-400" />
            <h2 className="font-semibold">Connected accounts</h2>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-300 mb-1">
                  <strong>Autopilot needs publishing access.</strong> Connect LinkedIn so the agent can post on your behalf — only after you approve each draft.
                </p>
                <p className="text-sm text-slate-400">
                  We never publish silently. Disconnect any time.
                </p>
              </div>
            </div>
          </div>

          <ConnectionSettingsRow provider="linkedin" />
          <ConnectionSettingsRow provider="x" />
          <ConnectionSettingsRow provider="threads" />
          <ConnectionSettingsRow provider="instagram" />

          <div className="mt-6 pt-6 border-t border-slate-800/50 space-y-3">
            <p className="text-xs uppercase tracking-wider text-slate-500">Quick publish (manual mode)</p>
            {connectedPlatforms.filter((p) => p.name !== "LinkedIn").map((platform) => (
              <div key={platform.name} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{platform.icon}</span>
                  <span className="text-sm">{platform.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(platform.url, '_blank')}
                  data-testid={`button-open-${platform.name.toLowerCase()}`}
                >
                  <ExternalLink className="h-4 w-4 mr-1" /> Open
                </Button>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-indigo-400" />
            <h2 className="font-semibold">Timezone</h2>
          </div>
          <p className="text-sm text-slate-400 mb-3">
            Used to align your best-time-to-post heatmap, calendar slots, and scheduled posts.
          </p>
          <div className="flex items-center gap-3">
            <select
              value={currentTz}
              onChange={(e) => updateTz(e.target.value)}
              className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white"
              data-testid="select-timezone"
            >
              {tzOptions.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
            {currentTz !== detectedTz && (
              <Button variant="ghost" size="sm" onClick={() => updateTz(detectedTz)} data-testid="button-tz-detected">
                Use detected ({detectedTz})
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Bell className="h-5 w-5 text-amber-400" />
            <h2 className="font-semibold">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2" data-testid="row-pref-email-digests">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-indigo-400 mt-0.5" />
                <div>
                  <div className="font-medium">Weekly email digest</div>
                  <div className="text-sm text-slate-400">A Monday recap with your top scores, scheduled posts, and prediction accuracy.</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={emailDigests}
                  disabled={prefsQuery.isLoading || updatePrefs.isPending}
                  onChange={(e) => updatePrefs.mutate(e.target.checked)}
                  data-testid="toggle-email-digests"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700"
                onClick={() => sendTestDigest.mutate()}
                disabled={sendTestDigest.isPending || !user?.email}
                data-testid="button-send-test-digest"
              >
                <Mail className="h-4 w-4 mr-2" />
                {sendTestDigest.isPending ? "Sending…" : "Send me a test digest"}
              </Button>
            </div>
            {[
              { label: 'Analysis complete', desc: 'Get notified in-app when your content analysis is ready' },
              { label: 'Tips & suggestions', desc: 'Personalized tips based on your content patterns' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-slate-400">{item.desc}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between items-center"
        >
          <a href="/api/logout">
            <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </a>
          <Button variant="ghost" className="text-slate-400 hover:text-white">
            <Shield className="h-4 w-4 mr-2" />
            Privacy & Security
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
