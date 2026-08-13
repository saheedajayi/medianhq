"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { TopSignupNoticeBanner } from "@/components/dashboard/top-signup-notice-banner";
import { DashboardHeroBanner } from "@/components/dashboard/dashboard-hero-banner";
import { ProfileCompletionCard } from "@/components/dashboard/profile-completion-card";
import { MentorsForYouSection } from "@/components/dashboard/mentors-for-you-section";
import { UpcomingSessionsCard } from "@/components/dashboard/upcoming-sessions-card";
import { ActionItemsCard } from "@/components/dashboard/action-items-card";

function calculateCompletionPercentage(userProfile?: {
  avatarUrl?: string | null;
  gender?: string | null;
  location?: string | null;
  bio?: string | null;
} | null): number {
  if (!userProfile) return 80;
  let filledCount = 0;
  if (userProfile.avatarUrl) filledCount++;
  if (userProfile.gender) filledCount++;
  if (userProfile.location) filledCount++;
  if (userProfile.bio) filledCount++;

  return 80 + filledCount * 5;
}

export default function DashboardPage() {
  const { data: user } = useCurrentUser();
  const completionPercentage = calculateCompletionPercentage(user?.menteeProfile);
  const is100PercentComplete = completionPercentage === 100;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Top Notice Banner (Visible strictly when completion reaches 100%) */}
      {is100PercentComplete && <TopSignupNoticeBanner />}

      {/* Hero Banner with Geometric Tile Pattern & Dynamic Logged In User Greeting */}
      <DashboardHeroBanner upcomingCount={0} />

      {/* Profile Completion Meter (Visible when completion is < 100%) */}
      {!is100PercentComplete && (
        <ProfileCompletionCard percentage={completionPercentage} />
      )}

      {/* Mentors For You Recommendation Grid */}
      <MentorsForYouSection />

      {/* Bottom Grid: Upcoming Sessions & Action Items */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingSessionsCard />
        <ActionItemsCard />
      </div>
    </div>
  );
}
