import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";

/** Shell of the dashboard's list cards (Upcoming Sessions, Action Items) while bookings load */
export function DashboardListCardSkeleton({
  title,
  rows,
  withAvatar = false,
}: {
  title: string;
  rows: number;
  withAvatar?: boolean;
}) {
  return (
    <SkeletonGroup
      label={`Loading ${title.toLowerCase()}`}
      className="flex min-h-[300px] flex-col rounded-3xl border border-[#EAECF0] bg-white p-6 md:p-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-wider text-[#667085] uppercase">{title}</h2>
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="my-4 flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-2xl border border-[#EAECF0] bg-[#F9FAFB] p-4"
          >
            {withAvatar ? (
              <Skeleton className="size-11 shrink-0 rounded-full" />
            ) : (
              <Skeleton className="size-4 shrink-0 rounded-full" />
            )}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonGroup>
  );
}
