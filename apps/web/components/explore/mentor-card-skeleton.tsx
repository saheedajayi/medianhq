import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";
import { cn } from "@/lib/utils";

/** Mirrors MentorCard: photo, name, role, stats, bio, tags, availability footer */
export function MentorCardSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-[20px] border border-[#F2F2F7] bg-white p-6">
      <div className="flex flex-col items-center">
        <Skeleton className="mb-3.5 size-[110px] rounded-full" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="mt-2 h-3 w-44" />
        <div className="mt-3 flex items-center gap-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="mt-4 w-full space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="mx-auto h-3 w-4/5" />
        </div>
        <div className="mt-4 flex gap-1.5">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-[#F2F4F7] pt-4">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
    </div>
  );
}

export function MentorCardGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <SkeletonGroup
      label="Loading mentors"
      className={cn("grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3", className)}
    >
      {Array.from({ length: count }).map((_, index) => (
        <MentorCardSkeleton key={index} />
      ))}
    </SkeletonGroup>
  );
}
