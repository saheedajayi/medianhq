import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";
import { cn } from "@/lib/utils";
import { cardClass } from "../shared/shared";

const twoColumnClass = "grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]";

/** Shaped like the overview: five stat cards, then two rows of a wide and a narrow card */
export function OverviewSkeleton() {
  return (
    <SkeletonGroup label="Loading platform overview" className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className={cn(cardClass, "flex flex-col gap-3 p-5")}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {[300, 160].map((height) => (
        <div key={height} className={twoColumnClass}>
          <div className={cn(cardClass, "p-6")}>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="mt-6 w-full" style={{ height }} />
          </div>
          <div className={cn(cardClass, "p-6")}>
            <Skeleton className="h-5 w-28" />
            <Skeleton className="mt-6 w-full" style={{ height: height - 60 }} />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}
