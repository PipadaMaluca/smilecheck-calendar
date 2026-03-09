import { Skeleton } from "@/components/ui/skeleton";

export function AgendaSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Skeleton className="h-6 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>

      {/* Dentist columns */}
      <div className="flex gap-2 px-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex-1 space-y-2">
            <div className="flex items-center gap-2 p-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            {Array.from({ length: 6 }).map((_, j) => (
              <Skeleton
                key={j}
                className="h-12 w-full rounded-lg"
                style={{ opacity: 1 - j * 0.1 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
