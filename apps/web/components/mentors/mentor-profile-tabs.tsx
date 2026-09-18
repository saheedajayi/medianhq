"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { MentorDetailProfile } from "./types";

interface MentorProfileTabsProps {
  mentor: MentorDetailProfile;
  activeTab: "profile" | "reviews";
  onTabChange: (tab: "profile" | "reviews") => void;
}

export function MentorProfileTabs({
  mentor,
  activeTab,
  onTabChange,
}: MentorProfileTabsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Segmented Tab Bar */}
      <div>
        <div className="inline-flex h-11 items-center gap-1 rounded-full border border-[#EAECF0]/70 bg-[#F7F8FB] p-1">
          <button
            type="button"
            onClick={() => onTabChange("profile")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-150 ${
              activeTab === "profile"
                ? "bg-white font-semibold text-[#FF5500] shadow-2xs"
                : "text-[#475467] hover:text-[#101828]"
            }`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => onTabChange("reviews")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-150 ${
              activeTab === "reviews"
                ? "bg-white font-semibold text-[#FF5500] shadow-2xs"
                : "text-[#475467] hover:text-[#101828]"
            }`}
          >
            Reviews
          </button>
        </div>
      </div>

      {/* Tab 1: Profile View (Bio, Expertise, Experience) */}
      {activeTab === "profile" && (
        <div className="flex flex-col gap-5">
          {/* Bio Section Card */}
          <div className="rounded-2xl border border-[#F2F2F7] bg-white p-6 shadow-2xs">
            <h2 className="text-base font-bold text-[#101828]">Bio</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#475467]">
              {mentor.bio}
            </p>
          </div>

          {/* Expertise Section Card */}
          <div className="rounded-2xl border border-[#F2F2F7] bg-white p-6 shadow-2xs">
            <h2 className="text-base font-bold text-[#101828]">Expertise</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {mentor.expertise.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full bg-[#F7F8FB] px-3.5 py-1.5 text-xs font-medium text-[#344054]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Experience Timeline Card */}
          <div className="rounded-2xl border border-[#F2F2F7] bg-white p-6 shadow-2xs">
            <h2 className="text-base font-bold text-[#101828]">Experience</h2>
            <div className="mt-4 flex flex-col gap-5">
              {mentor.experience.map((item, index) => (
                <div key={`${item.role}-${index}`} className="relative flex items-start gap-3.5">
                  {/* Timeline Bullet with Connecting Vertical Line */}
                  <div className="relative flex flex-col items-center">
                    <div className="mt-1 size-3 rounded-full bg-[#FF5500]" />
                    {index < mentor.experience.length - 1 && (
                      <div className="mt-1 h-10 w-0.5 bg-[#EAECF0]" />
                    )}
                  </div>

                  {/* Role & Company Details */}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#101828]">
                      {item.role}
                    </span>
                    <span className="text-xs text-[#667085]">
                      {item.company} • {item.period}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Reviews View */}
      {activeTab === "reviews" && (
        <div className="rounded-2xl border border-[#F2F2F7] bg-white p-6 shadow-2xs">
          {/* Header Score */}
          <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
            <h2 className="text-base font-bold text-[#101828]">Reviews</h2>
            <div className="flex items-center gap-1.5">
              <Star className="size-4.5 fill-[#FDB022] text-[#FDB022]" />
              <span className="text-base font-bold text-[#101828]">
                {mentor.rating} ({mentor.reviewCount})
              </span>
            </div>
          </div>

          {/* Reviews List */}
          <div className="flex flex-col divide-y divide-[#EAECF0]">
            {mentor.reviews.map((review) => (
              <div key={review.id} className="flex flex-col gap-2.5 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 overflow-hidden rounded-full border border-[#EAECF0] bg-[#F2F4F7]">
                      <Image
                        src={review.authorAvatar || "/mentor-avatar.png"}
                        alt={review.authorName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[#101828]">
                        {review.authorName}
                      </span>
                      <span className="text-xs text-[#667085]">
                        {review.date}
                      </span>
                    </div>
                  </div>

                  {/* 5 Stars */}
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-3.5 fill-[#FDB022] text-[#FDB022]"
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-[#475467]">
                  "{review.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
