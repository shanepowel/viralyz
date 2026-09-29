import { Skeleton } from "@repo/ui/skeleton";

export { Skeleton };

export function CreatorCardSkeleton() {
  return (
    <div className="rounded-md border border-line bg-raised p-4 shadow-sm">
      <Skeleton className="mb-4 h-36 w-full rounded-md" />
      <Skeleton className="mb-2 h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="rounded-md border border-line bg-raised p-4 shadow-sm">
      <Skeleton className="mb-4 h-40 w-full rounded-md" />
      <Skeleton className="mb-2 h-3 w-24" />
      <Skeleton className="mb-2 h-5 w-4/5" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}
