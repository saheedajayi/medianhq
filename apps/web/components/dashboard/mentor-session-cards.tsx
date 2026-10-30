"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, formatDistanceToNowStrict } from "date-fns";
import { toast } from "sonner";
import { DeclineRequestModal } from "@/components/bookings/decline-request-modal";
import type { Booking } from "@/components/bookings/types";
import { useAcceptBooking, useDeclineBooking } from "@/services/bookings/queries/bookings.queries";
import { DashboardListCardSkeleton } from "./dashboard-list-card-skeleton";

const VISIBLE_ROWS = 3;

const cardClass = "flex min-h-[300px] flex-col rounded-3xl border border-[#EAECF0] bg-white p-6";
const titleClass = "text-sm font-medium uppercase text-[#667085]";
const viewAllClass = "text-xs font-semibold text-[#FF5514] hover:underline";
const rowClass = "flex flex-col gap-3 rounded-2xl border border-[#EAECF0] bg-[#F9FAFB] p-4 sm:px-6";

// "June 8th, 2026"
const formatSessionDate = (booking: Booking) =>
  booking.startsAt ? format(new Date(booking.startsAt), "MMMM do, yyyy") : booking.relativeDate;

function Participant({ booking }: { booking: Booking }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-[#F2F4F7]">
        <Image
          src={booking.participantAvatar || "/default-avatar.svg"}
          alt={booking.participantName}
          fill
          className="object-cover"
        />
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-base text-[#101828]">{booking.participantName}</h3>
        <p className="truncate text-sm text-[#667085]">
          {booking.durationMinutes} mins {booking.title}
        </p>
      </div>
    </div>
  );
}

function RowMeta({ parts }: { parts: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-[#475467] sm:text-base">
      {parts.map((part, index) => (
        <span key={part} className="flex items-center gap-2.5">
          {index > 0 && <span className="size-2 rounded-full bg-[#D0D5DD]" aria-hidden="true" />}
          {part}
        </span>
      ))}
    </div>
  );
}

function EmptyCard({ title, heading, body }: { title: string; heading: string; body: string }) {
  return (
    <div className={cardClass}>
      <h2 className={titleClass}>{title}</h2>
      <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
        <div className="relative mb-4 flex size-14 items-center justify-center rounded-full bg-[#FFEEE8]">
          <span className="size-6 rounded-full bg-[#FFA98A]" />
          <span className="absolute bottom-4 right-3.5 size-1.5 rounded-full bg-[#FF5514]" />
        </div>
        <h3 className="text-lg text-[#101828]">{heading}</h3>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#667085]">{body}</p>
      </div>
    </div>
  );
}

export function MentorUpcomingSessionsCard({
  sessions,
  isLoading = false,
}: {
  sessions: Booking[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <DashboardListCardSkeleton title="Upcoming Sessions" rows={2} withAvatar />;
  }

  if (sessions.length === 0) {
    return (
      <EmptyCard
        title="Upcoming Sessions"
        heading="No upcoming sessions"
        body="Sessions you've accepted will appear here."
      />
    );
  }

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between gap-4">
        <h2 className={titleClass}>Upcoming Sessions</h2>
        {sessions.length > VISIBLE_ROWS && (
          <Link href="/mentor/bookings?tab=upcoming" className={viewAllClass}>
            <span className="text-[#FF5514]">View all ({sessions.length})</span>
          </Link>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-4">
        {sessions.slice(0, VISIBLE_ROWS).map((session) => (
          <div key={session.id} className={rowClass}>
            <div className="flex items-center justify-between gap-3">
              <Participant booking={session} />
              {/* The lobby and call live on the bookings page */}
              {session.isReadyToJoin && (
                <Link
                  href="/mentor/bookings?tab=upcoming"
                  className="shrink-0 rounded-full bg-[#FF5514] px-3.5 py-2 text-sm font-medium text-white transition hover:bg-[#E04406]"
                >
                  <span className="text-white">Join now</span>
                </Link>
              )}
            </div>
            <RowMeta parts={[formatSessionDate(session), session.timeFormatted]} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BookingRequestsCard({
  requests,
  isLoading = false,
}: {
  requests: Booking[];
  isLoading?: boolean;
}) {
  const acceptBooking = useAcceptBooking();
  const declineBooking = useDeclineBooking();
  const [bookingToDecline, setBookingToDecline] = useState<Booking | null>(null);

  const handleAccept = async (booking: Booking) => {
    try {
      await acceptBooking.mutateAsync(booking.id);
      toast.success(`Session confirmed. ${booking.participantName} has been notified.`);
    } catch {
      toast.error("We couldn't accept this request. Please try again.");
    }
  };

  const handleConfirmDecline = async (bookingId: string, reason: string) => {
    try {
      await declineBooking.mutateAsync({ id: bookingId, reason });
      toast.success(`Request declined. ${bookingToDecline?.participantName} will get a full refund.`);
      setBookingToDecline(null);
    } catch {
      toast.error("We couldn't decline this request. Please try again.");
    }
  };

  if (isLoading) {
    return <DashboardListCardSkeleton title="Booking Requests" rows={2} withAvatar />;
  }

  if (requests.length === 0) {
    return (
      <EmptyCard
        title="Booking Requests"
        heading="No booking requests"
        body="New requests from mentees will appear here."
      />
    );
  }

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between gap-4">
        <h2 className={titleClass}>Booking Requests</h2>
        {requests.length > VISIBLE_ROWS && (
          <Link href="/mentor/bookings?tab=pending" className={viewAllClass}>
            <span className="text-[#FF5514]">View all ({requests.length})</span>
          </Link>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-4">
        {requests.slice(0, VISIBLE_ROWS).map((request) => (
          <div key={request.id} className={rowClass}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Participant booking={request} />
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  disabled={acceptBooking.isPending}
                  onClick={() => handleAccept(request)}
                  className="rounded-full bg-[#FF5514] px-3.5 py-2 text-sm font-medium text-white transition hover:bg-[#E04406] disabled:opacity-60"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => setBookingToDecline(request)}
                  className="rounded-full border border-[#D0D5DD] bg-white px-3.5 py-2 text-sm font-medium text-[#344054] transition hover:bg-[#F2F4F7]"
                >
                  Decline
                </button>
              </div>
            </div>
            <RowMeta
              parts={[
                ...(request.requestedAt
                  ? [`Requested ${formatDistanceToNowStrict(new Date(request.requestedAt))} ago`]
                  : []),
                formatSessionDate(request),
                request.timeFormatted,
              ]}
            />
          </div>
        ))}
      </div>

      {bookingToDecline && (
        <DeclineRequestModal
          booking={bookingToDecline}
          onClose={() => setBookingToDecline(null)}
          onConfirmDecline={handleConfirmDecline}
        />
      )}
    </div>
  );
}
