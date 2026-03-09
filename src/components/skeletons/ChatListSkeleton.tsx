import { Skeleton } from "@/components/ui/skeleton";

export function ChatListSkeleton() {
  return (
    <div className="space-y-0 divide-y divide-border animate-fade-in">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-4">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-3/4" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="w-5 h-5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
