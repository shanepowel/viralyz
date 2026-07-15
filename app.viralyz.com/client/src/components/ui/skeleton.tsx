import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/10", className)}
      {...props}
    />
  )
}

function ContentCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-card overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

function ProfileGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-1 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-sm md:rounded-xl" />
      ))}
    </div>
  )
}

function TribeCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-36 p-4 rounded-2xl bg-white/5 border border-white/10">
      <Skeleton className="h-14 w-14 rounded-xl mx-auto mb-3" />
      <Skeleton className="h-4 w-20 mx-auto mb-2" />
      <Skeleton className="h-3 w-16 mx-auto" />
    </div>
  )
}

function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <ContentCardSkeleton key={i} />
      ))}
    </div>
  )
}

function DiscoverGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`rounded-xl ${i % 5 === 0 ? 'row-span-2 aspect-[9/16]' : 'aspect-[4/5]'}`} 
        />
      ))}
    </div>
  )
}

export { Skeleton, ContentCardSkeleton, ProfileGridSkeleton, TribeCardSkeleton, FeedSkeleton, DiscoverGridSkeleton }
