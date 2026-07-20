import { BlogCardSkeleton } from "@/components/ui/Skeleton";
import { Container } from "@/components/ui/Container";

export default function BlogLoading() {
  return (
    <div className="py-16">
      <Container>
        <div className="mb-8 h-10 w-48 animate-pulse rounded-sm bg-sunken" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      </Container>
    </div>
  );
}
