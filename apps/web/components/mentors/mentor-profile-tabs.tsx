"use client";

import { SegmentedTabs } from "@/components/ui/custom/segmented-tabs";
import { ProfileReviewsCard } from "./profile-reviews-card";
import { ProfileTimelineCard } from "./profile-timeline-card";
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
    <div className="flex flex-col gap-4">
      {/* Segmented Tab Bar */}
      <div>
        <SegmentedTabs
          tabs={[
            { value: "profile", label: "Profile" },
            { value: "reviews", label: "Reviews" },
          ]}
          activeTab={activeTab}
          onChange={onTabChange}
        />
      </div>

      {/* Tab 1: Profile View (Bio, Expertise, Experience) */}
      {activeTab === "profile" && (
        <div className="flex flex-col gap-4">
          {/* Bio Section Card */}
          <div className="rounded-[20px] border border-[#F2F2F7] bg-white p-6">
            <h2 className="text-lg font-semibold text-[#101828]">Bio</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#475467]">
              {mentor.bio}
            </p>
          </div>

          {/* Expertise Section Card */}
          <div className="rounded-[20px] border border-[#F2F2F7] bg-white p-6">
            <h2 className="text-lg font-semibold text-[#101828]">Expertise</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {mentor.expertise.length === 0 && (
                <p className="text-sm text-[#667085]">No expertise listed yet.</p>
              )}
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

          <ProfileTimelineCard title="Experience" items={mentor.experience} />
          {mentor.education.length > 0 && (
            <ProfileTimelineCard title="Education" items={mentor.education} />
          )}
        </div>
      )}

      {/* Tab 2: Reviews View */}
      {activeTab === "reviews" && (
        <ProfileReviewsCard
          rating={mentor.rating}
          reviewCount={mentor.reviewCount}
          reviews={mentor.reviews}
        />
      )}
    </div>
  );
}
