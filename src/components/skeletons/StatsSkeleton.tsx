import { Skeleton } from "@/components/ui/skeleton";

export function StatsSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* XP Bar */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>

      {/* Number cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card/80 rounded-lg p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-20" />
          </div>
        ))}
      </div>

      {/* Leaderboard rows */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-28 mb-3" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="w-6 h-6 rounded" />
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-3.5 w-28 flex-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
