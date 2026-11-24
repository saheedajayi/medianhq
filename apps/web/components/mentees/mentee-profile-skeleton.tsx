import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";

/** Mirrors the mentee profile: the wide hero card, then the tabs and detail cards */
export function MenteeProfileSkeleton() {
  return (
    <SkeletonGroup label="Loading mentee profile" className="flex w-full flex-col gap-6 pb-16">
      <div className="flex flex-col items-center rounded-[20px] border border-[#FFEEE8] bg-[#FFFAF5] p-6">
        <Skeleton className="mb-3 size-[112px] rounded-full" />
        <Skeleton className="h-5 w-44" />
        <Skeleton className="mt-2 h-3.5 w-52" />
        <Skeleton className="mt-3 h-3.5 w-64" />
      </div>

      <div className="mx-auto flex w-full max-w-[596px] flex-col gap-4">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="space-y-3 rounded-[20px] border border-[#F2F2F7] bg-white p-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </SkeletonGroup>
  );
}
