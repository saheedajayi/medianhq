import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";

/** Mirrors AvailableDates: a row of date cards, then a row of time chips */
export function AvailableDatesSkeleton() {
  return (
    <SkeletonGroup label="Loading available times" className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-14" />
        </div>
        <div className="grid grid-cols-5 gap-2.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-[#EAECF0] px-1 py-3"
            >
              <Skeleton className="h-2.5 w-7" />
              <Skeleton className="h-4 w-11" />
              <Skeleton className="h-2.5 w-9" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <div className="grid grid-cols-4 gap-2.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 rounded-xl" />
          ))}
        </div>
      </div>
    </SkeletonGroup>
  );
}
