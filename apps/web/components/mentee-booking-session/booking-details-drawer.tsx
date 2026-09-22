"use client";

import * as React from "react";
import Image from "next/image";
import { X, ArrowRight, Star, Check, Clock } from "lucide-react";
import { Booking } from "./types";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/base/sheet";

interface BookingDetailsDrawerProps {
  booking: Booking | null;
  onClose: () => void;
  onJoinSession: (booking: Booking) => void;
  onConfirmAttendance: (bookingId: string) => void;
  onOpenReschedule: (booking: Booking) => void;
  onOpenCancel: (booking: Booking) => void;
  onOpenReview: (booking: Booking) => void;
}

export function BookingDetailsDrawer({
  booking,
  onClose,
  onJoinSession,
  onConfirmAttendance,
  onOpenReschedule,
  onOpenCancel,
  onOpenReview,
}: BookingDetailsDrawerProps) {
  const lastBookingRef = React.useRef<Booking | null>(null);
  if (booking) {
    lastBookingRef.current = booking;
  }
  const currentBooking = booking ?? lastBookingRef.current;

  return (
    <Sheet open={!!booking} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border border-[#EAECF0] bg-white p-0 shadow-2xl sm:top-2 sm:right-2 sm:bottom-2 sm:h-[calc(100vh-16px)] sm:max-w-[600px] sm:rounded-[20px]"
      >
        <SheetTitle className="sr-only">Booking Details</SheetTitle>

        {currentBooking && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            {/* Top Mentor Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-[#EAECF0] bg-[#F2F4F7]">
                  <Image
                    src={currentBooking.mentorAvatar}
                    alt={currentBooking.mentorName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#101828]">
                    {currentBooking.mentorName}
                  </h2>
                  <p className="mt-0.5 text-sm !text-[#667085]">
                    {currentBooking.mentorRole}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3">
                    {currentBooking.linkedinUrl ? (
                      <a
                        href={currentBooking.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium !text-[#FF5514] transition hover:underline"
                      >
                        View LinkedIn profile
                        <ArrowRight className="size-4 stroke-[2.5]" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium !text-[#FF5514]">
                        View LinkedIn profile
                        <ArrowRight className="size-4 stroke-[2.5]" />
                      </span>
                    )}

                    {(currentBooking.tab === "pending" ||
                      currentBooking.status === "awaiting_confirmation") && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF6EE] px-3 py-1 text-xs font-semibold text-[#B93815] border border-[#FECDCA]/60">
                        <Clock className="size-3.5" />
                        Awaiting mentor confirmation
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Circular Close Button via SheetClose */}
              <SheetClose asChild>
                <button
                  type="button"
                  aria-label="Close details"
                  className="flex size-8 items-center justify-center rounded-full bg-[#F7F8FB] text-[#101828] transition hover:bg-[#EAECF0]"
                >
                  <X className="size-4 stroke-[2.5]" />
                </button>
              </SheetClose>
            </div>

            <hr className="my-6 border-[#EAECF0]" />

            {/* SESSION DETAILS Section */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#667085]">
                SESSION DETAILS
              </span>

              <div className="mt-4 space-y-3.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#667085]">Session Name</span>
                  <span className="font-semibold text-[#101828]">
                    {currentBooking.title}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#667085]">Date & Time</span>
                  <span className="text-right font-semibold text-[#101828]">
                    {currentBooking.fullDateTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#667085]">Duration</span>
                  <span className="font-semibold text-[#101828]">
                    {currentBooking.durationMinutes || 30} mins
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#667085]">Price</span>
                  <span className="font-semibold text-[#101828]">
                    {currentBooking.price}
                  </span>
                </div>
                {(currentBooking.tab === "pending" ||
                  currentBooking.status === "awaiting_confirmation") && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#667085]">Booking Status</span>
                    <span className="font-semibold text-[#F79009]">Pending</span>
                  </div>
                )}
                {currentBooking.tab === "past" && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#667085]">Session Status</span>
                    <span className="font-semibold text-[#027A48]">Completed</span>
                  </div>
                )}
                {currentBooking.tab === "cancelled" && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#667085]">Session Status</span>
                    <span className="font-semibold text-[#D92D20]">
                      {currentBooking.status === "no_show" || currentBooking.isNoShow
                        ? "No-show"
                        : "Cancelled"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <hr className="my-6 border-[#EAECF0]" />

            {/* YOUR NOTE / MENTEE NOTE & GOALS Section */}
            {currentBooking.tab !== "past" && (
              <>
                {currentBooking.note && (
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-[#667085]">
                      {currentBooking.status === "no_show" || currentBooking.isNoShow
                        ? "MENTEE NOTE"
                        : "YOUR NOTE"}
                    </span>
                    <div className="mt-3 rounded-[8px] bg-[#F7F8FB] p-4 text-sm leading-relaxed text-[#344054]">
                      {currentBooking.note}
                    </div>
                  </div>
                )}

                {/* YOUR GOALS Section */}
                <div className="mt-6">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#667085]">
                    {currentBooking.status === "no_show" || currentBooking.isNoShow
                      ? "MENTEE'S GOALS"
                      : "YOUR GOALS"}
                  </span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(currentBooking.goals && currentBooking.goals.length > 0
                      ? currentBooking.goals
                      : ["Career switch", "Fintech", "Healthtech"]
                    ).map((goal) => (
                      <span
                        key={goal}
                        className="rounded-full bg-[#F7F8FB] px-4 py-1.5 text-xs font-medium text-[#344054]"
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Outcome/Actions based on tab: Cancelled vs Pending vs Upcoming */}
                {currentBooking.tab === "cancelled" ? (
                  currentBooking.status === "no_show" || currentBooking.isNoShow ? (
                    /* Mentee - No-Show Details.svg */
                    <div>
                      <hr className="my-6 border-[#EAECF0]" />
                      <span className="block text-xs font-semibold uppercase tracking-wider text-[#667085]">
                        ATTENDANCE OUTCOME
                      </span>
                      <div className="mt-4 space-y-3.5 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[#667085]">Absentee</span>
                          <span className="font-semibold text-[#101828]">
                            {currentBooking.absentee || "Mentor"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#667085]">Refund</span>
                          <span className="font-semibold text-[#101828]">
                            {currentBooking.refundAmount || currentBooking.price || "₦15,000"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Mentee - Cancelled Booking Details.svg */
                    <div>
                      <hr className="my-6 border-[#EAECF0]" />
                      <span className="block text-xs font-semibold uppercase tracking-wider text-[#667085]">
                        CANCELLATION OUTCOME
                      </span>
                      <div className="mt-4 space-y-3.5 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[#667085]">Cancelled by</span>
                          <span className="font-semibold text-[#101828]">
                            {currentBooking.cancelledBy || "You"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#667085]">Notice</span>
                          <span className="font-semibold text-[#101828]">
                            {currentBooking.cancellationNotice ||
                              "More than 24 hours before session"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#667085]">Refund</span>
                          <span className="font-semibold text-[#101828]">
                            {currentBooking.refundAmount || currentBooking.price || "₦15000"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <span className="block text-xs font-semibold uppercase tracking-wider text-[#667085]">
                          CANCELLATION REASON
                        </span>
                        <div className="mt-3 rounded-[8px] bg-[#F7F8FB] p-4 text-sm leading-relaxed text-[#344054]">
                          {currentBooking.cancellationReason ||
                            "Mentee had a last-minute work conflict and requested to reschedule the CV review for a later time."}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={onClose}
                        className="mt-8 w-full rounded-full bg-[#FF5514] py-3.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#E04406] active:scale-[0.99]"
                      >
                        Send message
                      </button>
                    </div>
                  )
                ) : currentBooking.tab === "pending" ||
                  currentBooking.status === "awaiting_confirmation" ? (
                  /* Pending Booking Actions matching Mentee - Pending Booking Detail.svg */
                  <div className="mt-8 space-y-3">
                    <button
                      type="button"
                      onClick={() => onOpenReschedule(currentBooking)}
                      className="w-full rounded-full bg-[#FF5514] py-3.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#E04406] active:scale-[0.99]"
                    >
                      Reschedule
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenCancel(currentBooking)}
                      className="w-full rounded-full border border-[#EC221F] bg-white py-3.5 text-sm font-semibold text-[#EC221F] shadow-xs transition hover:bg-[#FEF3F2] active:scale-[0.99]"
                    >
                      Cancel request
                    </button>
                  </div>
                ) : (
                  /* Upcoming Booking Actions */
                  <>
                    <div className="mt-8 space-y-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (currentBooking.status === "confirmed") {
                            onJoinSession(currentBooking);
                          } else {
                            onConfirmAttendance(currentBooking.id);
                          }
                        }}
                        className="w-full rounded-full bg-[#FF5514] py-3.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#E04406] active:scale-[0.99]"
                      >
                        {currentBooking.status === "confirmed"
                          ? "Join session"
                          : "Confirm attendance"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                        }}
                        className="w-full rounded-full border border-[#FF8D62] bg-white py-3.5 text-sm font-semibold text-[#FF5514] shadow-xs transition hover:bg-[#FDF9F6] active:scale-[0.99]"
                      >
                        Send message
                      </button>
                    </div>

                    {/* Footer Links: Reschedule & Cancel session */}
                    <div className="mt-10 flex items-center gap-8 pt-2">
                      <button
                        type="button"
                        onClick={() => onOpenReschedule(currentBooking)}
                        className="text-sm font-semibold text-[#FF5514] hover:underline"
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenCancel(currentBooking)}
                        className="text-sm font-semibold text-[#FF5514] hover:underline"
                      >
                        Cancel session
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Past Bookings Sections */}
            {currentBooking.tab === "past" && (
              <div>
                {/* FEEDBACK FROM YOUR MENTOR */}
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#667085]">
                    FEEDBACK FROM YOUR MENTOR
                  </span>
                  <div className="mt-4 flex items-start gap-4">
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`size-4 ${
                            s <= (currentBooking.rating || 4)
                              ? "fill-[#FF9500] text-[#FF9500]"
                              : "text-[#D0D5DD]"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-[#344054]">
                      {currentBooking.review ||
                        "You came well-prepared with specific questions, were receptive to feedback, and took detailed notes. Great session overall."}
                    </p>
                  </div>
                </div>

                {/* ACTION ITEMS ASSIGNED */}
                <div className="mt-6">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#667085]">
                    ACTION ITEMS ASSIGNED
                  </span>
                  <div className="mt-3.5 space-y-3">
                    {(currentBooking.actionItems &&
                    currentBooking.actionItems.length > 0
                      ? currentBooking.actionItems
                      : [
                          {
                            id: "a1",
                            text: "Restructure your CV to lead with impact metrics",
                            completed: true,
                          },
                          {
                            id: "a2",
                            text: "Add 3 quantified achievements per role",
                            completed: true,
                          },
                          {
                            id: "a3",
                            text: "Remove your outdated skills section",
                            completed: false,
                          },
                          {
                            id: "a4",
                            text: "Update your LinkedIn headline to match your target role",
                            completed: false,
                          },
                        ]
                    ).map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        {item.completed ? (
                          <div className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-[#12B76A] text-white">
                            <Check className="size-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="size-4.5 shrink-0 rounded-full border-2 border-[#D0D5DD]" />
                        )}
                        <span className="text-sm font-medium text-[#344054]">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SESSION NOTES */}
                <div className="mt-6">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#667085]">
                    SESSION NOTES
                  </span>
                  <div className="mt-3 rounded-[12px] bg-[#F7F8FB] p-5 text-sm leading-relaxed text-[#344054]">
                    {currentBooking.sessionNotes ||
                      "You discussed CV structure and ATS optimization strategies. AbdulLah shared a CV template via session notepad. He recommends a follow-up in 2 weeks to review your revised CV."}
                  </div>
                </div>

                {/* Conditional Review mentor CTA matching Mentee - Past Bookings Not reviewed.svg */}
                {!currentBooking.hasMenteeReviewed && (
                  <button
                    type="button"
                    onClick={() => onOpenReview(currentBooking)}
                    className="mt-8 w-full rounded-full bg-[#FF5514] py-3.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#E04406] active:scale-[0.99]"
                  >
                    Review mentor
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
