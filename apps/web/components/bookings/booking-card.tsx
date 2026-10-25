"use client";

import Image from "next/image";
import { Clock, Timer } from "lucide-react";
import { Booking, ViewerRole } from "./types";
import { formatTimeLeft } from "./booking-utils";

interface BookingCardProps {
  booking: Booking;
  viewerRole: ViewerRole;
  onViewDetails: (booking: Booking) => void;
  onJoinSession: (booking: Booking) => void;
  onReschedule: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onReview: (booking: Booking) => void;
  onAccept: (booking: Booking) => void;
  onDecline: (booking: Booking) => void;
  /** Disables Accept while a response is being saved */
  isResponding?: boolean;
  /** Opens the chat with the other person, starting one if needed */
  onSendMessage: (booking: Booking) => void;
}

const primaryButton =
  "inline-flex h-9 items-center justify-center rounded-full bg-[#FF5514] px-5 text-sm font-medium text-white transition hover:bg-[#E04406] active:scale-[0.98]";
// Chips and buttons follow the bookings designs: 26px chips, 36px buttons
const chipClass = "inline-flex h-[26px] items-center rounded-full bg-[#F7F8FB] px-3 text-xs text-[#344054]";
const secondaryButton =
  "inline-flex h-9 items-center justify-center rounded-full border border-[#FF8D62] bg-white px-5 text-sm font-medium text-[#FF5514] transition hover:bg-[#FDF9F6] active:scale-[0.98]";

// "3:00 PM - 3:30 PM" -> "3:00pm" (card shows the start time only)
function formatStartTime(timeFormatted: string) {
  const start = timeFormatted.split(" - ")[0] ?? timeFormatted;
  return start.replace(/\s*(AM|PM)$/i, (_, period: string) => period.toLowerCase());
}

export function BookingCard({
  booking,
  viewerRole,
  onViewDetails,
  onJoinSession,
  onReschedule,
  onCancel,
  onReview,
  onAccept,
  onDecline,
  isResponding = false,
  onSendMessage,
}: BookingCardProps) {
  const timeLeft = booking.tab === "pending" ? formatTimeLeft(booking.respondBy) : null;
  const isMentor = viewerRole === "mentor";
  // Orange time column for requests to answer and sessions whose room is open
  const isHighlighted =
    (isMentor && booking.tab === "pending") || (booking.tab === "upcoming" && !!booking.isReadyToJoin);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[20px] border border-[#EAECF0] bg-white transition-all hover:border-[#D0D5DD] sm:flex-row sm:items-stretch">
      {/* Left Column: Scheduled Time & Subtext with #FDF9F6 (highlighted) or #FCFCFD */}
      <div
        className={`flex w-full shrink-0 flex-col items-center justify-center px-4 py-7 sm:w-40 ${
          isHighlighted ? "bg-[#FDF9F6]" : "bg-[#FCFCFD]"
        }`}
      >
        <p
          className={`text-2xl font-semibold tracking-tight ${
            isHighlighted ? "text-[#FF5514]" : "text-[#344054]"
          }`}
        >
          {formatStartTime(booking.timeFormatted)}
        </p>
        <p
          className={`mt-1 text-[15px] ${
            isHighlighted ? "text-[#FF5514]" : "text-[#667085]"
          }`}
        >
          {booking.relativeDate}
        </p>
      </div>

      {/* Middle & Right Content Column */}
      <div className="flex flex-1 flex-col justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-7">
        {/* Session Title, Badges, and Participant Info */}
        <div className="space-y-3.5">
          {/* Title and Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-[#101828]">{booking.title}</h3>
            <span className={chipClass}>
              {booking.durationMinutes ? `${booking.durationMinutes}mins` : booking.duration}
            </span>
            <span className={chipClass}>
              {booking.price}
            </span>
            {/* The response countdown below says the same thing while it's running */}
            {!isMentor && booking.status === "awaiting_confirmation" && !timeLeft && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF6EE] px-2.5 py-0.5 text-xs font-semibold text-[#B93815]">
                <Clock className="size-3" />
                Awaiting mentor confirmation
              </span>
            )}
            {(booking.status === "declined" || booking.status === "expired") && (
              <span className="rounded-full bg-[#F7F0EB] px-2.5 py-0.5 text-xs font-semibold text-[#71271D]">
                {booking.statusLabel ?? (booking.status === "declined" ? "Declined" : "Expired")}
              </span>
            )}
          </div>

          {/* Participant Summary */}
          <div className="flex items-center gap-3">
            <div className="relative size-11 shrink-0 overflow-hidden rounded-full border border-[#EAECF0] bg-[#F2F4F7]">
              <Image
                src={booking.participantAvatar || "/default-avatar.svg"}
                alt={booking.participantName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="text-[15px] text-[#101828]">{booking.participantName}</h4>
              <p className="text-[13px] text-[#667085]">{booking.participantRole}</p>
            </div>
          </div>

          {/* Response countdown matching the Pending designs */}
          {timeLeft && (
            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F0EB] px-2.5 py-0.5 text-xs font-medium text-[#71271D]">
                <Timer className="size-3.5" />
                {isMentor ? `${timeLeft} to respond` : `Mentor has ${timeLeft} to respond`}
              </span>
            </div>
          )}

          {/* No-show Badge matching Mentee - Cancelled Bookings.svg */}
          {(booking.status === "no_show" || booking.isNoShow) && (
            <div className="pt-0.5">
              <span className="inline-flex rounded-full bg-[#F7F0EB] px-2.5 py-0.5 text-xs font-semibold text-[#71271D]">
                No-show
              </span>
            </div>
          )}

          {/* Mentors can read a request's details before answering */}
          {isMentor && booking.tab === "pending" && (
            <button
              type="button"
              onClick={() => onViewDetails(booking)}
              className="text-sm font-medium text-[#FF5514] hover:underline"
            >
              View details
            </button>
          )}

          {/* Upcoming bookings link to the chat with the other person */}
          {booking.tab === "upcoming" && (
            <button
              type="button"
              onClick={() => onSendMessage(booking)}
              className="text-sm font-medium text-[#FF5514] hover:underline"
            >
              Send message
            </button>
          )}
        </div>

        {/* Right Column: Dynamic Action Buttons */}
        <div className="flex shrink-0 items-center gap-3">
          {booking.tab === "upcoming" && (
            <>
              <button type="button" onClick={() => onViewDetails(booking)} className={secondaryButton}>
                View details
              </button>
              {/* The room opens 15 minutes before the start; until then either side can reschedule */}
              {booking.isReadyToJoin ? (
                <button type="button" onClick={() => onJoinSession(booking)} className={primaryButton}>
                  Join session
                </button>
              ) : (
                <button type="button" onClick={() => onReschedule(booking)} className={primaryButton}>
                  Reschedule
                </button>
              )}
            </>
          )}

          {booking.tab === "past" && (
            <>
              <button type="button" onClick={() => onViewDetails(booking)} className={secondaryButton}>
                View details
              </button>
              {(isMentor ? !booking.hasMentorReviewed : !booking.hasMenteeReviewed) && (
                <button type="button" onClick={() => onReview(booking)} className={primaryButton}>
                  {isMentor ? "Write a review" : "Review mentor"}
                </button>
              )}
            </>
          )}

          {booking.tab === "pending" &&
            (isMentor ? (
              <>
                <button type="button" onClick={() => onDecline(booking)} className={secondaryButton}>
                  Decline
                </button>
                <button
                  type="button"
                  disabled={isResponding}
                  onClick={() => onAccept(booking)}
                  className={`${primaryButton} disabled:opacity-60`}
                >
                  Accept
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => onViewDetails(booking)} className={secondaryButton}>
                  View details
                </button>
                <button type="button" onClick={() => onCancel(booking)} className={primaryButton}>
                  Cancel request
                </button>
              </>
            ))}

          {booking.tab === "cancelled" && (
            <button type="button" onClick={() => onViewDetails(booking)} className={secondaryButton}>
              View details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
