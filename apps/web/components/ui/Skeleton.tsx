import { cn } from "@/lib/cn";

function Block({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-sunken", className)}
      aria-hidden
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <Block className={className} />;
}

export function CreatorCardSkeleton() {
  return (
    <div className="rounded-md border border-line bg-raised p-4 shadow-sm">
      <Block className="mb-4 h-36 w-full rounded-md" />
      <Block className="mb-2 h-4 w-2/3" />
      <Block className="h-3 w-1/2" />
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="rounded-md border border-line bg-raised p-4 shadow-sm">
      <Block className="mb-4 h-40 w-full rounded-md" />
      <Block className="mb-2 h-3 w-24" />
      <Block className="mb-2 h-5 w-4/5" />
      <Block className="h-3 w-full" />
    </div>
  );
}

Skeleton.CreatorCard = CreatorCardSkeleton;
Skeleton.BlogCard = BlogCardSkeleton;
