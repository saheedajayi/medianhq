"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/services/auth/queries/auth.queries";
import { TopSignupNoticeBanner } from "@/components/dashboard/top-signup-notice-banner";
import { DashboardHeroBanner } from "@/components/dashboard/dashboard-hero-banner";
import { ProfileCompletionCard } from "@/components/dashboard/profile-completion-card";
import { MentorApplicationStatusCard } from "@/components/dashboard/mentor-application-status-card";
import { MentorsForYouSection } from "@/components/dashboard/mentors-for-you-section";
import { UpcomingSessionsCard } from "@/components/dashboard/upcoming-sessions-card";
import { ActionItemsCard } from "@/components/dashboard/action-items-card";
import { useMyBookings } from "@/services/bookings/queries/bookings.queries";
import type { Booking } from "@/components/bookings/types";

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

export function DashboardView() {
  const { data: user } = useCurrentUser();
  const isMentor = user?.role === "MENTOR";
  const completionPercentage = calculateCompletionPercentage(
    isMentor ? user?.mentorProfile : user?.menteeProfile
  );
  const is100PercentComplete = completionPercentage === 100;

  const { data: bookings, isLoading: isLoadingBookings } = useMyBookings({ enabled: !!user });
  // Mentee stats come from bookings; until they arrive, show placeholders rather than zeros
  const isLoadingStats = !user || (!isMentor && isLoadingBookings);
  // Mentors answer requests from their bookings page; the dashboard points them there
  const pendingRequestCount = isMentor
    ? (bookings ?? []).filter((b) => b.tab === "pending").length
    : 0;

  const { upcomingSessions, actionItems, stats } = useMemo(() => {
    if (isMentor || !Array.isArray(bookings)) {
      return { upcomingSessions: [] as Booking[], actionItems: [] as any[], stats: undefined };
    }

    const typedBookings = bookings as unknown as Booking[];
    const upcoming = typedBookings.filter(
      (b) => b.tab === "upcoming" || b.status === "confirmed"
    );

    // Collect action items
    const allActionItems: any[] = [];
    typedBookings.forEach((b) => {
      if (Array.isArray(b.actionItems)) {
        b.actionItems.forEach((ai) => {
          allActionItems.push({
            ...ai,
            participantName: b.participantName,
          });
        });
      }
    });

    // Derive statistics
    const completedCount = typedBookings.filter(
      (b) => b.status === "completed" || b.tab === "past"
    ).length;
    const bookedCount = typedBookings.length;
    const pendingItems = allActionItems.filter((i) => !i.completed).length;
    const mentorsMatchedCount = new Set(
      typedBookings.map((b) => b.participantName).filter(Boolean)
    ).size;

    return {
      upcomingSessions: upcoming,
      actionItems: allActionItems,
      stats: [
        {
          label: "SESSIONS DONE",
          value: completedCount,
          subtext: `${completedCount} completed`,
        },
        {
          label: "SESSIONS BOOKED",
          value: bookedCount,
          subtext: `${upcoming.length} upcoming`,
        },
        {
          label: "ACTION ITEMS",
          value: allActionItems.length,
          subtext: `${pendingItems} pending`,
        },
        {
          label: "MENTORS MATCHED",
          value: mentorsMatchedCount,
          subtext: `${mentorsMatchedCount} connected`,
        },
      ] as { label: string; value: number | string; subtext: string }[],
    };
  }, [bookings, isMentor]);

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Top Notice Banner (Visible strictly when completion reaches 100% for mentees) */}
      {!isMentor && is100PercentComplete && <TopSignupNoticeBanner />}

      {/* Hero Banner with Geometric Tile Pattern & Dynamic Logged In User Greeting */}
      <DashboardHeroBanner
        upcomingCount={upcomingSessions.length}
        stats={stats}
        isLoading={isLoadingStats}
      />

      {/* Mentors also see their application status; both roles complete their profile */}
      {pendingRequestCount > 0 && (
        <Link
          href="/mentor/bookings?tab=pending"
          className="flex items-center justify-between gap-4 rounded-2xl border border-[#FFCAB6] bg-[#FDF9F6] px-5 py-4 transition hover:border-[#FF8D62]"
        >
          <span className="text-sm font-semibold text-[#101828]">
            {pendingRequestCount === 1
              ? "You have a session request waiting for your response."
              : `You have ${pendingRequestCount} session requests waiting for your response.`}
          </span>
          <span className="shrink-0 text-sm font-semibold text-[#FF5514]">Review requests</span>
        </Link>
      )}

      {isMentor && user?.mentorStatus !== "APPROVED" && (
        <MentorApplicationStatusCard status={user?.mentorStatus} />
      )}
      {!is100PercentComplete && (
        <ProfileCompletionCard
          percentage={completionPercentage}
          description={
            isMentor
              ? "Add your photo, location and bio so mentees can get to know you."
              : undefined
          }
        />
      )}

      {!isMentor && <MentorsForYouSection />}

      {/* Bottom Grid: Upcoming Sessions & Action Items */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingSessionsCard sessions={upcomingSessions} isLoading={isLoadingStats} />
        <ActionItemsCard actionItems={actionItems} isLoading={isLoadingStats} />
      </div>
    </div>
  );
}
