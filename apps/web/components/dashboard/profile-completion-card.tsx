"use client";

import { useState } from "react";
import { ProfileUpdateModal } from "./profile-update-modal";

interface ProfileCompletionCardProps {
  percentage?: number;
}

export function ProfileCompletionCard({ percentage = 80 }: ProfileCompletionCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate SVG stroke parameters for circular progress gauge
  const radius = 33;
  const strokeWidth = 6.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl border border-[#FFDEC9] bg-[#FFF9F6] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3.5 shadow-2xs">
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
              Complete it to improve your search results.
            </p>
          </div>
        </div>

        {/* Complete Profile Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#FF5500] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#E04B00] active:scale-[0.98] sm:text-sm"
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
