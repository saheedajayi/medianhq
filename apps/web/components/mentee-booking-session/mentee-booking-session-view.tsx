"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Clock, Calendar, CheckCircle2 } from "lucide-react";
import {
  Booking,
  BookingTab,
  MeetingFlowState,
  RecordingOption,
  ActionItem,
} from "./types";
import { initialBookings } from "./mock-bookings";
import { BookingDetailsDrawer } from "./booking-details-drawer";
import { RescheduleSessionModal } from "./reschedule-session-modal";
import { CancelSessionModal } from "./cancel-session-modal";
import { SessionLobby } from "./session-lobby";
import { LiveVideoSessionRoom } from "./live-video-session-room";
import { SessionReviewModal } from "./session-review-modal";
import { SessionCompletedModal } from "./session-completed-modal";
import { SegmentedTabs, SegmentedTabItem } from "@/components/ui/custom/segmented-tabs";
import { bookingsService } from "@/services/bookings";
import { reviewsService } from "@/services/reviews";

const tabs: SegmentedTabItem<BookingTab>[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "pending", label: "Pending" },
  { value: "past", label: "Past" },
  { value: "cancelled", label: "Cancelled" },
];

export function MenteeBookingSessionView() {
  const [activeTab, setActiveTab] = useState<BookingTab>("upcoming");
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  useEffect(() => {
    let isMounted = true;
    bookingsService
      .getMine()
      .then((res: any) => {
        if (!isMounted || !Array.isArray(res) || res.length === 0) return;
        setBookings(res as any);
      })
      .catch((err) => {
        console.warn("Could not fetch bookings from backend API, using preview mock dataset:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Active drawers and modal states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);

  // Meeting flow states
  const [meetingBooking, setMeetingBooking] = useState<Booking | null>(null);
  const [meetingFlow, setMeetingFlow] = useState<MeetingFlowState>("none");
  const [recordingChoice, setRecordingChoice] = useState<RecordingOption>("do_not_record");
  const [initialMicOn, setInitialMicOn] = useState(true);
  const [initialCameraOn, setInitialCameraOn] = useState(true);
  // LiveKit session credentials
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [livekitServerUrl, setLivekitServerUrl] = useState<string | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered bookings by current tab
  const currentList = bookings.filter((b) => b.tab === activeTab);

  // Triggering Meeting Flows
  const handleStartMeetingFlow = (booking: Booking) => {
    setSelectedBooking(null);
    setMeetingBooking(booking);
    setMeetingFlow("lobby");
  };

  const handleEnterMeeting = (
    recChoice: RecordingOption,
    micOn: boolean,
    cameraOn: boolean,
    token: string,
    serverUrl: string
  ) => {
    setRecordingChoice(recChoice);
    setInitialMicOn(micOn);
    setInitialCameraOn(cameraOn);
    setLivekitToken(token);
    setLivekitServerUrl(serverUrl);
    setMeetingFlow("live_room");
  };

  const handleEndCall = () => {
    setMeetingFlow("review");
  };

  const handleSubmitReview = async (reviewData: {
    rating: number;
    review: string;
    actionItems: ActionItem[];
  }) => {
    if (meetingBooking) {
      try {
        await reviewsService.create({
          bookingId: meetingBooking.id,
          rating: reviewData.rating,
          comment: reviewData.review,
        });
      } catch (err) {
        console.warn("Could not save review to backend API, saving locally:", err);
      }

      setBookings((prev) =>
        prev.map((b) =>
          b.id === meetingBooking.id
            ? {
                ...b,
                tab: "past",
                status: "completed",
                statusLabel: "Completed",
                rating: reviewData.rating,
                review: reviewData.review,
                actionItems: reviewData.actionItems,
              }
            : b
        )
      );
    }
    setMeetingFlow("completed");
  };

  const handleBackToBookings = () => {
    setMeetingFlow("none");
    setMeetingBooking(null);
    setActiveTab("past");
  };

  // Reschedule and Cancel Handlers
  const handleConfirmReschedule = async (
    bookingId: string,
    newDate: string,
    newTime: string
  ) => {
    try {
      await bookingsService.reschedule(bookingId, `${newDate}T${newTime}`);
    } catch (err) {
      console.warn("Could not reschedule on backend API, updating locally:", err);
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              timeFormatted: newTime,
              relativeDate: newDate,
              fullDateTime: `${newDate} · ${newTime}`,
            }
          : b
      )
    );
    setRescheduleBooking(null);
    if (selectedBooking?.id === bookingId) {
      setSelectedBooking(null);
    }
    showToast("Session successfully rescheduled!");
  };

  const handleConfirmAttendance = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: "confirmed",
              statusLabel: "Confirmed",
              isReadyToJoin: true,
            }
          : b
      )
    );
    if (selectedBooking?.id === bookingId) {
      setSelectedBooking((prev) =>
        prev
          ? {
              ...prev,
              status: "confirmed",
              statusLabel: "Confirmed",
              isReadyToJoin: true,
            }
          : null
      );
    }
    showToast("Attendance confirmed successfully!");
  };

  const handleConfirmCancel = async (bookingId: string) => {
    try {
      await bookingsService.cancel(bookingId, "Schedule conflict");
    } catch (err) {
      console.warn("Could not cancel on backend API, updating locally:", err);
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              tab: "cancelled",
              status: "cancelled",
              statusLabel: "Cancelled",
              cancelledBy: "You",
              cancellationNotice: "More than 24 hours before session",
              cancellationReason: "Schedule conflict",
              refundAmount: b.price,
            }
          : b
      )
    );
    setCancelBooking(null);
    if (selectedBooking?.id === bookingId) {
      setSelectedBooking(null);
    }
    showToast("Booking cancelled successfully.");
  };

  // If in meeting lobby:
  if (meetingFlow === "lobby" && meetingBooking) {
    return (
      <SessionLobby
        booking={meetingBooking}
        onBack={() => {
          setMeetingFlow("none");
          setMeetingBooking(null);
        }}
        onEnterMeeting={handleEnterMeeting}
      />
    );
  }

  // If in live video session room:
  if (meetingFlow === "live_room" && meetingBooking && livekitToken && livekitServerUrl) {
    return (
      <LiveVideoSessionRoom
        booking={meetingBooking}
        recordingOption={recordingChoice}
        livekitToken={livekitToken}
        livekitServerUrl={livekitServerUrl}
        onEndCall={handleEndCall}
      />
    );
  }

  return (
    <div className="relative w-full flex-1 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[#101828] px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="size-4 text-[#12B76A]" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#101828]">Bookings</h1>
        <p className="mt-1 text-sm text-[#667085]">
          Review your booked mentor sessions and confirm attendance.
        </p>
      </div>

      {/* Segmented Status Tabs */}
      <div className="mb-8">
        <SegmentedTabs<BookingTab>
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          size="lg"
          activeTabClassName="text-[#FF5514]"
        />
      </div>

      {/* Bookings Card List */}
      <div className="space-y-4">
        {currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#EAECF0] py-20 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#F2F4F7] text-[#667085]">
              <Calendar className="size-6" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-[#101828]">
              No {activeTab} bookings
            </h3>
            <p className="mt-1 text-xs text-[#667085]">
              You don&apos;t have any {activeTab} mentor sessions at this time.
            </p>
          </div>
        ) : (
          currentList.map((booking) => {
            const isConfirmed = booking.status === "confirmed";

            return (
              <div
                key={booking.id}
                className="group relative flex flex-col overflow-hidden rounded-[20px] border border-[#EAECF0] bg-white transition-all hover:border-[#D0D5DD] hover:shadow-xs sm:flex-row sm:items-stretch"
              >
                {/* Left Column: Scheduled Time & Subtext with #FDF9F6 (confirmed) or #FCFCFD (not confirmed) */}
                <div
                  className={`flex w-full shrink-0 flex-col items-center justify-center px-6 py-7 sm:w-44 ${
                    isConfirmed ? "bg-[#FDF9F6]" : "bg-[#FCFCFD]"
                  }`}
                >
                  <p
                    className={`text-2xl sm:text-3xl font-semibold tracking-tight ${
                      isConfirmed ? "text-[#FF5514]" : "text-[#101828]"
                    }`}
                  >
                    {booking.timeFormatted}
                  </p>
                  <p
                    className={`mt-1 text-xs font-medium ${
                      isConfirmed ? "text-[#FF5514]" : "text-[#667085]"
                    }`}
                  >
                    {booking.relativeDate}
                  </p>
                </div>

                {/* Middle & Right Content Column */}
                <div className="flex flex-1 flex-col justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-7">
                  {/* Session Title, Badges, and Mentor Info */}
                  <div className="space-y-3">
                    {/* Title and Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-[#101828]">
                        {booking.title}
                      </h3>
                      <span className="rounded-full bg-[#F2F4F7] px-2.5 py-0.5 text-xs text-[#344054]">
                        {booking.duration}
                      </span>
                      <span className="rounded-full bg-[#F2F4F7] px-2.5 py-0.5 text-xs text-[#344054]">
                        {booking.price}
                      </span>
                      {isConfirmed && (
                        <span className="rounded-full bg-[#ECFDF3] px-2.5 py-0.5 text-xs font-semibold text-[#027A48]">
                          Confirmed
                        </span>
                      )}
                      {booking.status === "awaiting_confirmation" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF6EE] px-2.5 py-0.5 text-xs font-semibold text-[#B93815]">
                          <Clock className="size-3" />
                          Awaiting mentor confirmation
                        </span>
                      )}
                    </div>

                    {/* Mentor Summary */}
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-[#EAECF0] bg-[#F2F4F7]">
                        <Image
                          src={booking.mentorAvatar}
                          alt={booking.mentorName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[#101828]">
                          {booking.mentorName}
                        </h4>
                        <p className="text-[11px] text-[#667085]">{booking.mentorRole}</p>
                      </div>
                    </div>

                    {/* No-show Badge matching Mentee - Cancelled Bookings.svg */}
                    {(booking.status === "no_show" || booking.isNoShow) && (
                      <div className="pt-0.5">
                        <span className="inline-flex rounded-full bg-[#F7F0EB] px-2.5 py-0.5 text-xs font-semibold text-[#71271D]">
                          No-show
                        </span>
                      </div>
                    )}

                    {/* View details link for upcoming */}
                    {booking.tab === "upcoming" && (
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(booking)}
                        className="text-xs font-semibold text-[#FF5514] hover:underline"
                      >
                        View details
                      </button>
                    )}
                  </div>

                  {/* Right Column: Dynamic Action Buttons */}
                  <div className="flex shrink-0 items-center gap-3">
                    {booking.tab === "upcoming" && (
                      <>
                        {isConfirmed ? (
                          <button
                            type="button"
                            onClick={() => handleStartMeetingFlow(booking)}
                            className="rounded-full bg-[#FF5514] px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#E04406] active:scale-[0.98]"
                          >
                            Join session
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setSelectedBooking(booking)}
                              className="rounded-full border border-[#FF8D62] bg-white px-5 py-2.5 text-xs font-semibold text-[#FF5514] shadow-xs transition hover:bg-[#FDF9F6] active:scale-[0.98]"
                            >
                              Confirm attendance
                            </button>
                            <button
                              type="button"
                              onClick={() => setRescheduleBooking(booking)}
                              className="rounded-full bg-[#FF5514] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#E04406] active:scale-[0.98]"
                            >
                              Reschedule
                            </button>
                          </>
                        )}
                      </>
                    )}

                    {booking.tab === "past" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(booking)}
                          className="rounded-full border border-[#FF8D62] bg-white px-5 py-2.5 text-xs font-semibold text-[#FF5514] shadow-xs transition hover:bg-[#FDF9F6] active:scale-[0.98]"
                        >
                          View details
                        </button>
                        {!booking.hasMenteeReviewed && (
                          <button
                            type="button"
                            onClick={() => {
                              setMeetingBooking(booking);
                              setMeetingFlow("review");
                            }}
                            className="rounded-full bg-[#FF5514] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#E04406] active:scale-[0.98]"
                          >
                            Review mentor
                          </button>
                        )}
                      </>
                    )}

                    {booking.tab === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(booking)}
                          className="rounded-full border border-[#FF8D62] bg-white px-5 py-2.5 text-xs font-semibold text-[#FF5514] shadow-xs transition hover:bg-[#FDF9F6] active:scale-[0.98]"
                        >
                          View details
                        </button>
                        <button
                          type="button"
                          onClick={() => setCancelBooking(booking)}
                          className="rounded-full bg-[#FF5514] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#E04406] active:scale-[0.98]"
                        >
                          Cancel request
                        </button>
                      </>
                    )}

                    {booking.tab === "cancelled" && (
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(booking)}
                        className="rounded-full border border-[#FF8D62] bg-white px-5 py-2.5 text-xs font-semibold text-[#FF5514] shadow-xs transition hover:bg-[#FDF9F6] active:scale-[0.98]"
                      >
                        View details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Booking Details Drawer */}
      <BookingDetailsDrawer
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onJoinSession={(b) => handleStartMeetingFlow(b)}
        onConfirmAttendance={handleConfirmAttendance}
        onOpenReschedule={(b) => {
          setSelectedBooking(null);
          setRescheduleBooking(b);
        }}
        onOpenCancel={(b) => {
          setSelectedBooking(null);
          setCancelBooking(b);
        }}
        onOpenReview={(b) => {
          setSelectedBooking(null);
          setMeetingBooking(b);
          setMeetingFlow("review");
        }}
      />

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <RescheduleSessionModal
          booking={rescheduleBooking}
          onClose={() => setRescheduleBooking(null)}
          onConfirmReschedule={handleConfirmReschedule}
        />
      )}

      {/* Cancel Modal */}
      {cancelBooking && (
        <CancelSessionModal
          booking={cancelBooking}
          onClose={() => setCancelBooking(null)}
          onConfirmCancel={handleConfirmCancel}
        />
      )}

      {/* Session Review Modal (after call or from past tab) */}
      {meetingFlow === "review" && meetingBooking && (
        <SessionReviewModal
          booking={meetingBooking}
          onClose={() => {
            setMeetingFlow("none");
            setMeetingBooking(null);
          }}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* Session Completed Confirmation Modal */}
      {meetingFlow === "completed" && meetingBooking && (
        <SessionCompletedModal
          booking={meetingBooking}
          onBackToBookings={handleBackToBookings}
        />
      )}
    </div>
  );
}
