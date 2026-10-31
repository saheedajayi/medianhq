"use client";

import { useMemo } from "react";
import { isSameMonth } from "date-fns";
import type { Booking } from "@/components/bookings/types";
import type { AuthUser } from "@/services/auth/types";
import { useBookingEvents } from "@/hooks/use-booking-events";
import { useMyBookings } from "@/services/bookings/queries/bookings.queries";
import { useMentorEarningsSummary } from "@/services/earnings/queries/earnings.queries";
import { useMentorAvailability } from "@/services/mentor-sessions/queries/mentor-sessions.queries";
import { useMentorReviews } from "@/services/reviews/queries/reviews.queries";
import { ActivationChecklistCard } from "./activation-checklist-card";
import { DashboardErrorState } from "./dashboard-error-state";
import { DashboardHeroBanner } from "./dashboard-hero-banner";
import { BookingRequestsCard, MentorUpcomingSessionsCard } from "./mentor-session-cards";

const isThisMonth = (booking: Booking) =>
  !!booking.startsAt && isSameMonth(new Date(booking.startsAt), new Date());

const REFRESH_ON_RETURN = { refetchOnWindowFocus: true };

/** The dashboard for approved mentors */
export function MentorDashboardView({ user }: { user?: AuthUser }) {
  useBookingEvents();
  const bookingsQuery = useMyBookings(REFRESH_ON_RETURN);
  const earningsQuery = useMentorEarningsSummary(REFRESH_ON_RETURN);
  const availabilityQuery = useMentorAvailability();
  const { data: bookingsData, isLoading: isLoadingBookings } = bookingsQuery;
  const { data: earnings, isLoading: isLoadingEarnings } = earningsQuery;
  const { data: reviews, isLoading: isLoadingReviews } = useMentorReviews(user?.id ?? "");
  const { data: availability, isLoading: isLoadingAvailability } = availabilityQuery;

  const bookings = useMemo(() => (bookingsData ?? []) as unknown as Booking[], [bookingsData]);
  const upcomingSessions = useMemo(() => bookings.filter((b) => b.tab === "upcoming"), [bookings]);
  const bookingRequests = useMemo(() => bookings.filter((b) => b.tab === "pending"), [bookings]);

  // A failed lookup shows a dash, so it can't be mistaken for a real zero
  const stats = [
    {
      label: "SESSIONS THIS MONTH",
      value: bookings.filter(
        (b) => isThisMonth(b) && (b.tab === "upcoming" || (b.tab === "past" && b.status === "completed"))
      ).length,
    },
    { label: "PENDING REQUESTS", value: bookingRequests.length },
    {
      label: "PENDING PAYOUT",
      // Everything earned but not paid out yet, requested or not.
      // The stat font has no ₦ glyph, so this follows the design's "N21,000"
      value: earnings
        ? `N${(earnings.availableBalance + earnings.pendingPayout).toLocaleString()}`
        : "-",
    },
    { label: "RATING", value: reviews?.count ? reviews.avgRating.toFixed(1) : "-" },
  ];

  // These would otherwise read as real zeros and unticked checklist steps.
  // A failed rating lookup doesn't count: its stat already shows a dash.
  const requiredQueries = [bookingsQuery, earningsQuery, availabilityQuery];
  const failedQueries = requiredQueries.filter((query) => query.isError && !query.data);

  if (failedQueries.length > 0) {
    return (
      <DashboardErrorState
        onRetry={() => failedQueries.forEach((query) => query.refetch())}
        isRetrying={requiredQueries.some((query) => query.isFetching)}
      />
    );
  }

  const profile = user?.mentorProfile;

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeroBanner
        showBookButton={false}
        upcomingCount={upcomingSessions.filter(isThisMonth).length}
        stats={stats}
        // Reviews are looked up by user ID, so they can't start until the user arrives
        isLoading={!user || isLoadingBookings || isLoadingEarnings || isLoadingReviews}
      />

      <ActivationChecklistCard
        userId={user?.id}
        isProfileComplete={!!(profile?.gender && profile.skills?.length && profile.tools?.length)}
        hasAvailability={(availability ?? []).some((slot) => slot.isActive !== false)}
        // Bank details aren't stored on their own yet; they're only sent with a payout request
        hasPayoutDetails={!!earnings?.recentPayouts.length}
        isLoading={!user || isLoadingEarnings || isLoadingAvailability}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MentorUpcomingSessionsCard sessions={upcomingSessions} isLoading={isLoadingBookings} />
        <BookingRequestsCard requests={bookingRequests} isLoading={isLoadingBookings} />
      </div>
    </div>
  );
}
