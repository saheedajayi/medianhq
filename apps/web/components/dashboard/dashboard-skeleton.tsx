import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";

/** Neutral dashboard outline, shown until we know whether the user is a mentor or mentee */
export function DashboardSkeleton() {
  return (
    <SkeletonGroup label="Loading dashboard" className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-[#EAECF0] p-4 md:gap-5 md:p-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-[300px] rounded-3xl" />
        <Skeleton className="h-[300px] rounded-3xl" />
      </div>
    </SkeletonGroup>
  );
}
