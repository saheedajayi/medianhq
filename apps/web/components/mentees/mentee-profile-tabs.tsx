"use client";

import { SegmentedTabs } from "@/components/ui/custom/segmented-tabs";
import { ProfileReviewsCard } from "@/components/mentors/profile-reviews-card";
import { ProfileTimelineCard } from "@/components/mentors/profile-timeline-card";
import type { MenteeDetailProfile } from "./types";

export type MenteeProfileTab = "profile" | "reviews";

const cardClass = "rounded-[20px] border border-[#F2F2F7] bg-white p-6";
const titleClass = "text-lg font-semibold text-[#101828]";

interface MenteeProfileTabsProps {
  mentee: MenteeDetailProfile;
  activeTab: MenteeProfileTab;
  onTabChange: (tab: MenteeProfileTab) => void;
}

export function MenteeProfileTabs({ mentee, activeTab, onTabChange }: MenteeProfileTabsProps) {
  return (
    <div className="flex flex-col gap-4">
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

      {activeTab === "profile" && (
        <div className="flex flex-col gap-4">
          <div className={cardClass}>
            <h2 className={titleClass}>Bio</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#475467]">
              {mentee.bio || "No bio added yet."}
            </p>
          </div>

          <div className={cardClass}>
            <h2 className={titleClass}>Expertise</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {mentee.expertise.length === 0 && (
                <p className="text-sm text-[#667085]">No expertise listed yet.</p>
              )}
              {mentee.expertise.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full bg-[#F7F8FB] px-3.5 py-1.5 text-xs font-medium text-[#344054]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {mentee.experience.length > 0 && (
            <ProfileTimelineCard title="Experience" items={mentee.experience} />
          )}
        </div>
      )}

      {activeTab === "reviews" && (
        <ProfileReviewsCard
          rating={mentee.rating}
          reviewCount={mentee.reviewCount}
          reviews={mentee.reviews}
        />
      )}
    </div>
  );
}
