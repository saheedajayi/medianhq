"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { TopSignupNoticeBanner } from "@/components/dashboard/top-signup-notice-banner";
import { DashboardHeroBanner } from "@/components/dashboard/dashboard-hero-banner";
import { ProfileCompletionCard } from "@/components/dashboard/profile-completion-card";
import { MentorApplicationStatusCard } from "@/components/dashboard/mentor-application-status-card";
import { MentorsForYouSection } from "@/components/dashboard/mentors-for-you-section";
import { UpcomingSessionsCard } from "@/components/dashboard/upcoming-sessions-card";
import { ActionItemsCard } from "@/components/dashboard/action-items-card";
import { bookingsService } from "@/services/bookings";
import type { Booking } from "@/components/mentee-booking-session/types";

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
  const isMentor = user?.role === "MENTOR";
  const completionPercentage = calculateCompletionPercentage(
    isMentor ? user?.mentorProfile : user?.menteeProfile
  );
  const is100PercentComplete = completionPercentage === 100;

  const [upcomingSessions, setUpcomingSessions] = useState<Booking[]>([]);
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [stats, setStats] = useState<
    { label: string; value: number | string; subtext: string }[] | undefined
  >(undefined);

  useEffect(() => {
    if (isMentor) return;

    let isMounted = true;
    bookingsService
      .getMine()
      .then((bookings: any) => {
        if (!isMounted || !Array.isArray(bookings)) return;

        const typedBookings = bookings as Booking[];
        const upcoming = typedBookings.filter(
          (b) => b.tab === "upcoming" || b.status === "confirmed"
        );
        setUpcomingSessions(upcoming);

        // Collect action items
        const allActionItems: any[] = [];
        typedBookings.forEach((b) => {
          if (Array.isArray(b.actionItems)) {
            b.actionItems.forEach((ai) => {
              allActionItems.push({
                ...ai,
                mentorName: b.mentorName,
              });
            });
          }
        });
        setActionItems(allActionItems);

        // Derive statistics
        const completedCount = typedBookings.filter(
          (b) => b.status === "completed" || b.tab === "past"
        ).length;
        const bookedCount = typedBookings.length;
        const pendingItems = allActionItems.filter((i) => !i.completed).length;
        const mentorsMatchedCount = new Set(
          typedBookings.map((b) => b.mentorName).filter(Boolean)
        ).size;

        setStats([
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
        ]);
      })
      .catch((err) => {
        console.warn("Could not load bookings for dashboard stats:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [isMentor]);

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Top Notice Banner (Visible strictly when completion reaches 100% for mentees) */}
      {!isMentor && is100PercentComplete && <TopSignupNoticeBanner />}

      {/* Hero Banner with Geometric Tile Pattern & Dynamic Logged In User Greeting */}
      <DashboardHeroBanner
        upcomingCount={upcomingSessions.length}
        stats={stats}
      />

      {/* Mentors also see their application status; both roles complete their profile */}
      {isMentor && <MentorApplicationStatusCard />}
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
        <UpcomingSessionsCard sessions={upcomingSessions} />
        <ActionItemsCard actionItems={actionItems} />
      </div>
    </div>
  );
}
