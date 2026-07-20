import { CreatorCardSkeleton } from "@/components/ui/Skeleton";
import { Container } from "@/components/ui/Container";

export default function CreatorsLoading() {
  return (
    <div className="py-16">
      <Container>
        <div className="mb-8 h-10 w-64 animate-pulse rounded-sm bg-sunken" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CreatorCardSkeleton key={i} />
          ))}
        </div>
      </Container>
    </div>
  );
}
