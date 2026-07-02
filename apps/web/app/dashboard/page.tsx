import Link from "next/link";
import { TOOLS } from "@repo/config";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Calendar,
  FileText,
  Hash,
  Image,
  MessageCircle,
  Plus,
  Store,
  TrendingUp,
  UserCircle,
  Users,
  Video,
} from "lucide-react";

const iconMap = {
  TrendingUp,
  FileText,
  Users,
  Video,
  UserCircle,
  Hash,
  Image,
  Calendar,
  MessageCircle,
  Store,
};

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">
            Your creator command center — pick a tool to get started.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Credits remaining</p>
          <p className="mt-1 text-3xl font-bold">12</p>
          <p className="mt-1 text-xs text-muted-foreground">Free plan</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Active projects</p>
          <p className="mt-1 text-3xl font-bold">0</p>
          <p className="mt-1 text-xs text-muted-foreground">Create your first project</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Competitors tracked</p>
          <p className="mt-1 text-3xl font-bold">0</p>
          <p className="mt-1 text-xs text-muted-foreground">Up to 5 on free plan</p>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Quick launch</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => {
          const Icon = iconMap[tool.icon as keyof typeof iconMap];
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="mb-1 font-medium">{tool.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {tool.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
