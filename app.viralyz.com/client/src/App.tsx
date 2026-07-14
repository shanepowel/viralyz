import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Analyze from "@/pages/analyze";
import ContentLibrary from "@/pages/content-library";
import Analytics from "@/pages/analytics-page";
import Competitors from "@/pages/competitors";
import Community from "@/pages/community";
import Profile from "@/pages/profile";
import MessagesPage from "@/pages/messages";
import HookLab from "@/pages/hook-lab";
import CaptionStudio from "@/pages/caption-studio";
import Trends from "@/pages/trends";
import Ideas from "@/pages/ideas";
import SettingsPage from "@/pages/settings-page";
import Admin from "@/pages/admin";
import Privacy from "@/pages/privacy";
import Accessibility from "@/pages/accessibility";
import ModernSlavery from "@/pages/modern-slavery";
import Terms from "@/pages/terms";
import Press from "@/pages/press";
import SharePage from "@/pages/share";
import Onboarding from "@/pages/onboarding";
import CalendarPage from "@/pages/calendar";
import BrandVoice from "@/pages/brand-voice";
import Thumbnails from "@/pages/thumbnails";
import SearchPage from "@/pages/search";
import SwipeFile from "@/pages/swipe-file";
import RepurposePage from "@/pages/repurpose";
import InsightsPage from "@/pages/insights";
import AutopilotPage from "@/pages/autopilot";
import IntelligencePage from "@/pages/intelligence";
import IntelligenceCompetitorPage from "@/pages/intelligence-competitor";
import { useTimezoneSync } from "@/hooks/use-timezone-sync";

function AuthenticatedRoutes() {
  const [location] = useLocation();
  const { user } = useAuth();
  useTimezoneSync();

  // Onboarding gate — keep simple, allow public legal pages and onboarding itself
  const onboarded = user?.onboardingCompleted ?? true;
  const exemptFromOnboarding =
    location === "/onboarding" ||
    location.startsWith("/share/") ||
    location === "/privacy" ||
    location === "/terms" ||
    location === "/accessibility" ||
    location === "/modern-slavery" ||
    location === "/press";

  if (!onboarded && !exemptFromOnboarding) {
    return <Redirect to="/onboarding" />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/autopilot" component={AutopilotPage} />
          <Route path="/autopilot/:missionId" component={AutopilotPage} />
          <Route path="/intelligence" component={IntelligencePage} />
          <Route path="/intelligence/:id" component={IntelligenceCompetitorPage} />
          <Route path="/analyze" component={Analyze} />
          <Route path="/analyze/:id" component={Analyze} />
          <Route path="/content" component={ContentLibrary} />
          <Route path="/calendar" component={CalendarPage} />
          <Route path="/brand-voice" component={BrandVoice} />
          <Route path="/thumbnails" component={Thumbnails} />
          <Route path="/search" component={SearchPage} />
          <Route path="/swipe-file" component={SwipeFile} />
          <Route path="/repurpose" component={RepurposePage} />
          <Route path="/insights" component={InsightsPage} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/competitors" component={Competitors} />
          <Route path="/community" component={Community} />
          <Route path="/profile/:userId" component={Profile} />
          <Route path="/messages" component={MessagesPage} />
          <Route path="/hook-lab" component={HookLab} />
          <Route path="/caption-studio" component={CaptionStudio} />
          <Route path="/trends" component={Trends} />
          <Route path="/ideas" component={Ideas} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/admin" component={Admin} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/accessibility" component={Accessibility} />
          <Route path="/modern-slavery" component={ModernSlavery} />
          <Route path="/terms" component={Terms} />
          <Route path="/press" component={Press} />
          <Route path="/share/:code" component={SharePage} />
          <Route component={NotFound} />
        </Switch>
      </motion.div>
    </AnimatePresence>
  );
}

function PublicRoutes() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/accessibility" component={Accessibility} />
      <Route path="/modern-slavery" component={ModernSlavery} />
      <Route path="/terms" component={Terms} />
      <Route path="/press" component={Press} />
      <Route path="/share/:code" component={SharePage} />
      <Route component={Landing} />
    </Switch>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return isAuthenticated ? <AuthenticatedRoutes /> : <PublicRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
