"use client";

import { useState } from "react";
import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";
import { ProfileUpdateModal } from "./profile-update-modal";

interface ProfileCompletionCardProps {
  percentage?: number;
  /** Optional subtitle; mentors see copy about how mentees find them */
  description?: string;
}

// The default grey disappears on this card's peach background
const SKELETON_TINT = "bg-[#FFE3D6]!";

/** Same layout as the card below, so nothing shifts when the percentage arrives */
export function ProfileCompletionCardSkeleton() {
  return (
    <SkeletonGroup
      label="Loading your profile progress"
      className="flex flex-col gap-4 rounded-2xl border border-[#FFDEC9] bg-[#FFF9F6] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3.5"
    >
      <div className="flex flex-1 items-center gap-4 sm:gap-5">
        {/* Progress ring: a tinted circle with the card colour punched out of the middle */}
        <div className="relative flex size-16 shrink-0 items-center justify-center sm:size-20">
          <Skeleton className={`absolute inset-[3px] rounded-full ${SKELETON_TINT}`} />
          <span className="absolute inset-[11px] rounded-full bg-[#FFF9F6]" />
          <Skeleton className={`relative h-4 w-7 sm:w-8 ${SKELETON_TINT}`} />
        </div>

        {/* Same line heights as the real title and description */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div>
            <div className="flex h-6 items-center sm:h-7">
              <Skeleton className={`h-4 w-full sm:h-5 sm:w-64 ${SKELETON_TINT}`} />
            </div>
            {/* Both lines of text wrap on a phone */}
            <div className="flex h-6 items-center sm:hidden">
              <Skeleton className={`h-4 w-2/5 ${SKELETON_TINT}`} />
            </div>
          </div>
          <div>
            <div className="flex h-4 items-center sm:h-5">
              <Skeleton className={`h-3 w-full sm:h-3.5 sm:w-72 ${SKELETON_TINT}`} />
            </div>
            <div className="flex h-4 items-center sm:hidden">
              <Skeleton className={`h-3 w-1/3 ${SKELETON_TINT}`} />
            </div>
          </div>
        </div>
      </div>

      <Skeleton className={`h-9 w-full shrink-0 rounded-full sm:h-10 sm:w-36 ${SKELETON_TINT}`} />
    </SkeletonGroup>
  );
}

export function ProfileCompletionCard({
  percentage = 80,
  description = "Complete it to improve your search results.",
}: ProfileCompletionCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate SVG stroke parameters for circular progress gauge
  const radius = 33;
  const strokeWidth = 6.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl border border-[#FFDEC9] bg-[#FFF9F6] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3.5">
        <div className="flex items-center gap-4 sm:gap-5">
          {/* SVG Circular Progress Gauge */}
          <div className="relative flex size-16 sm:size-20 shrink-0 items-center justify-center">
            <svg className="size-16 sm:size-20 -rotate-90 transform" viewBox="0 0 80 80">
              {/* Background circle */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-[#FFE0D3]"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-[#FF5500] transition-all duration-700 ease-out"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-sm font-extrabold text-[#101828] sm:text-base">
              {percentage}%
            </span>
          </div>

          {/* Text Content */}
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-semibold text-black sm:text-lg">
              Your profile is {percentage}% complete
            </h3>
            <p className="text-xs font-normal text-[#475467] sm:text-sm">
              {description}
            </p>
          </div>
        </div>

        {/* Complete Profile Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#FF5500] px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#E04B00] active:scale-[0.98] sm:text-sm"
        >
          <span className="text-white font-medium">Complete Profile</span>
        </button>
      </div>

      {/* Interactive Profile Update Modal with Blurred Backdrop Overlay */}
      <ProfileUpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
