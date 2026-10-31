"use client";

import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";

interface MentorApplicationStatusCardProps {
  /** MentorProfile status from the current user; only shown until the mentor is approved */
  status?: string;
}

// The default grey disappears on this card's peach background
const SKELETON_TINT = "bg-[#FFE3D6]!";

/** Same layout as the card below, so nothing shifts when the status arrives */
export function MentorApplicationStatusCardSkeleton() {
  return (
    <SkeletonGroup
      label="Loading your application status"
      className="flex flex-col gap-4 rounded-2xl border border-[#FFDEC9] bg-[#FFF9F6] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div>
          <div className="flex h-6 items-center sm:h-7">
            <Skeleton className={`h-4 w-full sm:h-5 sm:w-80 ${SKELETON_TINT}`} />
          </div>
          {/* The text wraps to more lines on a phone */}
          <div className="flex h-6 items-center sm:hidden">
            <Skeleton className={`h-4 w-1/4 ${SKELETON_TINT}`} />
          </div>
        </div>
        <div>
          <div className="flex h-[19.5px] items-center sm:h-[23px]">
            <Skeleton className={`h-3 w-full max-w-3xl sm:h-3.5 ${SKELETON_TINT}`} />
          </div>
          <div className="flex h-[19.5px] items-center sm:h-[23px]">
            <Skeleton className={`h-3 w-full sm:h-3.5 sm:w-2/3 sm:max-w-xl ${SKELETON_TINT}`} />
          </div>
          <div className="flex h-[19.5px] items-center sm:hidden">
            <Skeleton className={`h-3 w-full ${SKELETON_TINT}`} />
          </div>
          <div className="flex h-[19.5px] items-center sm:hidden">
            <Skeleton className={`h-3 w-1/4 ${SKELETON_TINT}`} />
          </div>
        </div>
      </div>
      <Skeleton className={`h-7 w-32 shrink-0 rounded-full sm:h-8 sm:w-36 ${SKELETON_TINT}`} />
    </SkeletonGroup>
  );
}

export function MentorApplicationStatusCard({ status }: MentorApplicationStatusCardProps) {
  const isRejected = status === "REJECTED";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#FFDEC9] bg-[#FFF9F6] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-[#101828] sm:text-lg">
          {isRejected
            ? "Your application to mentor wasn't approved this time."
            : "Your application to mentor is under review."}
        </h3>
        <p className="max-w-3xl text-xs font-normal text-[#475467] leading-relaxed sm:text-sm">
          {isRejected
            ? "We've emailed you our team's feedback. Reply to that email if you have any questions."
            : "Every mentor on Median is reviewed by a real person, that's what makes the community worth being part of. We'll be in touch within 7 days. We'll send you an email."}
        </p>
      </div>

      <div className="flex shrink-0 items-center sm:self-center">
        <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#F4E6E6] px-4 py-1.5 text-xs font-medium text-[#7A271A] sm:text-sm">
          {isRejected ? "Not approved" : "Pending approval"}
        </span>
      </div>
    </div>
  );
}
