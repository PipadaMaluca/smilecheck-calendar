import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ListSkeletonProps {
  rows?: number;
  showAvatar?: boolean;
  className?: string;
}

export function ListSkeleton({ rows = 5, showAvatar = false, className }: ListSkeletonProps) {
  return (
    <div className={cn("space-y-2 animate-fade-in", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
          {showAvatar && <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />}
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}
