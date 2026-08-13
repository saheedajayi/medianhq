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
      <div className="flex flex-col gap-3 rounded-2xl border border-[#FFDEC9] bg-[#FFF9F6] px-5 py-3 md:flex-row md:items-center md:justify-between md:px-6 md:py-3.5 shadow-2xs">
        <div className="flex items-center gap-5">
          {/* SVG Circular Progress Gauge */}
          <div className="relative flex size-20 shrink-0 items-center justify-center">
            <svg className="size-20 -rotate-90 transform" viewBox="0 0 80 80">
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
            <span className="absolute text-base font-extrabold text-[#101828]">
              {percentage}%
            </span>
          </div>

          {/* Text Content */}
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-medium text-black md:text-lg">
              Your profile is {percentage}% complete
            </h3>
            <p className="text-sm font-normal text-[#475467]">
              Complete it to improve your search results.
            </p>
          </div>
        </div>

        {/* Complete Profile Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#FF5500] px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-all hover:bg-[#E04B00] active:scale-[0.98]"
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
