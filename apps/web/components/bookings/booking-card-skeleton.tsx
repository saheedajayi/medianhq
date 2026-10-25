import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";

/** Mirrors BookingCard: time column, title with chips, participant, actions */
function BookingCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[20px] border border-[#EAECF0] bg-white sm:flex-row sm:items-stretch">
      <div className="flex w-full shrink-0 flex-col items-center justify-center gap-2 bg-[#FCFCFD] px-4 py-7 sm:w-40">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3.5 w-16" />
      </div>
      {/* Fixed-width placeholders can't wrap like text, so actions drop below until there's room */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-5 p-6 sm:p-7 lg:flex-row lg:items-center">
        <div className="min-w-0 space-y-3.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-28 sm:w-36" />
            <Skeleton className="h-[26px] w-16 rounded-full" />
            <Skeleton className="h-[26px] w-16 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function BookingListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <SkeletonGroup label="Loading bookings" className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <BookingCardSkeleton key={index} />
      ))}
    </SkeletonGroup>
  );
}
