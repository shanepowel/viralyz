import { cn } from "@/lib/cn";

function Block({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-inner bg-panel", className)}
      aria-hidden
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <Block className={className} />;
}

export function BlogCardSkeleton() {
  return (
    <div className="rounded-inner border border-line bg-card p-4">
      <Block className="mb-4 h-40 w-full rounded-inner" />
      <Block className="mb-2 h-3 w-24" />
      <Block className="mb-2 h-5 w-4/5" />
      <Block className="h-3 w-full" />
    </div>
  );
}

Skeleton.BlogCard = BlogCardSkeleton;
