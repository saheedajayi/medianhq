"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { TopSignupNoticeBanner } from "@/components/dashboard/top-signup-notice-banner";
import { DashboardHeroBanner } from "@/components/dashboard/dashboard-hero-banner";
import { ProfileCompletionCard } from "@/components/dashboard/profile-completion-card";
import { MentorsForYouSection } from "@/components/dashboard/mentors-for-you-section";
import { UpcomingSessionsCard } from "@/components/dashboard/upcoming-sessions-card";
import { ActionItemsCard } from "@/components/dashboard/action-items-card";

export default function DashboardPage() {
  const { data: user } = useCurrentUser();
  const isProfileComplete = Boolean(user?.isProfileComplete);

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Top Notice Banner (Visible when profile is completed) */}
      {isProfileComplete && <TopSignupNoticeBanner />}

      {/* Hero Banner with Geometric Tile Pattern & Dynamic Logged In User Greeting */}
      <DashboardHeroBanner upcomingCount={0} />

      {/* Profile Completion Meter (Visible when profile is incomplete) */}
      {!isProfileComplete && <ProfileCompletionCard percentage={80} />}

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
