import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";

/** Mirrors the mentor profile: hero card, tabs and detail cards, then the booking panel */
export function MentorProfileSkeleton() {
  return (
    <SkeletonGroup
      label="Loading mentor profile"
      className="grid w-full grid-cols-1 gap-8 pb-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center rounded-2xl border border-[#F2F2F7] bg-[#FDF9F6] p-6">
          <Skeleton className="mb-3 size-[112px] rounded-full" />
          <Skeleton className="h-5 w-44" />
          <Skeleton className="mt-2 h-3.5 w-52" />
          <div className="mt-3 flex gap-3">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>

        <div className="space-y-3 rounded-2xl border border-[#F2F2F7] bg-white p-5">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>

        <div className="space-y-3 rounded-2xl border border-[#F2F2F7] bg-white p-5">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>
        <div className="space-y-3 rounded-2xl border border-[#E9EAF0] bg-white p-4 sm:p-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2.5 rounded-xl border border-[#EAECF0] p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
          <Skeleton className="mt-2 h-12 w-full rounded-full" />
        </div>
      </div>
    </SkeletonGroup>
  );
}
