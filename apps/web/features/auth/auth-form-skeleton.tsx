import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";

/** Placeholder for an auth card's content: heading, fields and the main button */
export function AuthFormSkeleton({
  fields = 2,
  label = "Loading",
}: {
  fields?: number;
  label?: string;
}) {
  return (
    <SkeletonGroup label={label} className="w-full">
      <div className="mb-8 flex flex-col items-center gap-2.5">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="space-y-5">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-7 h-12 w-full rounded-full" />
    </SkeletonGroup>
  );
}
