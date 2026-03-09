import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CardGridSkeletonProps {
  cards?: number;
  columns?: string;
  className?: string;
}

export function CardGridSkeleton({ cards = 6, columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", className }: CardGridSkeletonProps) {
  return (
    <div className={cn("grid gap-4 animate-fade-in", columns, className)}>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="bg-card/80 rounded-xl p-4 space-y-3 border border-border">
          <div className="flex items-start gap-3">
            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}
