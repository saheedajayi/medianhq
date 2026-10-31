"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useBookingEvents } from "@/hooks/use-booking-events";
import { CheckCircle2 } from "lucide-react";
import { Calendar } from "iconsax-react";
import {
  Booking,
  BookingTab,
  MeetingFlowState,
  RecordingOption,
  ActionItem,
  ViewerRole,
} from "./types";
import { BookingCard } from "./booking-card";
import { BookingListSkeleton } from "./booking-card-skeleton";
import { BookingDetailsDrawer } from "./booking-details-drawer";
import { RescheduleSessionModal } from "./reschedule-session-modal";
import { CancelSessionModal } from "./cancel-session-modal";
import { DeclineRequestModal } from "./decline-request-modal";
import { SessionLobby } from "./session-lobby";
import { LiveVideoSessionRoom } from "./live-video-session-room";
import { SessionReviewModal } from "./session-review-modal";
import { SessionCompletedModal } from "./session-completed-modal";
import { SegmentedTabs, SegmentedTabItem } from "@/components/ui/custom/segmented-tabs";
import {
  useAcceptBooking,
  useCancelBooking,
  useDeclineBooking,
  useMyBookings,
  useRescheduleBooking,
  useSubmitMenteeFeedback,
} from "@/services/bookings/queries/bookings.queries";
import { useVerifyPayment } from "@/services/payments/queries/payments.queries";
import { useCreateReview } from "@/services/reviews/queries/reviews.queries";
import { stopAllMediaTracks } from "./media-utils";


const ROLE_CONFIG: Record<
  ViewerRole,
  {
    tabs: SegmentedTabItem<BookingTab>[];
    subtitle: string;
    emptyDescription: (tab: BookingTab) => string;
    messagesHref: string;
  }
> = {
  mentee: {
    tabs: [
      { value: "upcoming", label: "Upcoming" },
      { value: "pending", label: "Pending" },
      { value: "past", label: "Past" },
      { value: "cancelled", label: "Cancelled" },
    ],
    subtitle: "Review your sessions with mentors.",
    emptyDescription: (tab) => `You don't have any ${tab} mentor sessions at this time.`,
    messagesHref: "/mentee/messages",
  },
  mentor: {
    tabs: [
      { value: "upcoming", label: "Upcoming" },
      { value: "pending", label: "Pending" },
      { value: "past", label: "Past" },
      { value: "cancelled", label: "Cancelled" },
    ],
    subtitle: "Manage your sessions with mentees.",
    emptyDescription: (tab) => `You don't have any ${tab} sessions with mentees at this time.`,
    messagesHref: "/mentor/messages",
  },
};

export function BookingsView({ viewerRole }: { viewerRole: ViewerRole }) {
  const { tabs, subtitle, emptyDescription, messagesHref } = ROLE_CONFIG[viewerRole];
  const isMentor = viewerRole === "mentor";
  const isBookingTab = (value: string | null): value is BookingTab =>
    tabs.some((tab) => tab.value === value);
  const router = useRouter();

  // Active tab lives in ?tab= so it survives refreshes and can be linked to
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: BookingTab = isBookingTab(tabParam) ? tabParam : "upcoming";

  const setActiveTab = (tab: BookingTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    window.history.replaceState(null, "", `?${params.toString()}`);
  };
  const { data: apiBookings, isLoading } = useMyBookings();
  useBookingEvents();
  const rescheduleBookingMutation = useRescheduleBooking();
  const cancelBookingMutation = useCancelBooking();
  const acceptBookingMutation = useAcceptBooking();
  const declineBookingMutation = useDeclineBooking();
  const { mutateAsync: verifyPayment } = useVerifyPayment();
  const createReviewMutation = useCreateReview();
  const submitFeedbackMutation = useSubmitMenteeFeedback();

  // The API is the source of truth; every change below refetches it
  const bookings = useMemo<Booking[]>(
    () => (Array.isArray(apiBookings) ? (apiBookings as unknown as Booking[]) : []),
    [apiBookings]
  );

  useEffect(() => {
    let isMounted = true;

    // Returning from Paystack checkout (mentees only): confirm the payment, then refresh bookings
    if (isMentor) return;
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    if (params.get("payment") !== "success" || !reference) return;

    window.history.replaceState(null, "", window.location.pathname);
    // Refreshes bookings once settled, so the paid request shows under Pending
    verifyPayment(reference)
      .then((res) => {
        if (!isMounted) return;
        showToast(
          res?.verified
            ? "Payment confirmed. Your mentor has 24 hours to accept."
            : "We couldn't confirm your payment yet. We'll keep checking and email you."
        );
      })
      .catch((err) => {
        console.warn("Could not verify payment:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [isMentor, verifyPayment]);

  // Active drawers and modal states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [declineBooking, setDeclineBooking] = useState<Booking | null>(null);

  // Meeting flow states
  const [meetingBooking, setMeetingBooking] = useState<Booking | null>(null);
  const [meetingFlow, setMeetingFlow] = useState<MeetingFlowState>("none");
  const [recordingChoice, setRecordingChoice] = useState<RecordingOption>("do_not_record");
  // LiveKit session credentials
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [livekitServerUrl, setLivekitServerUrl] = useState<string | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const showError = (title: string, err: unknown) =>
    toast.error(title, {
      description: (err as { message?: string })?.message || "Please try again in a moment.",
    });

  // Opens the chat with the other person; the messages page starts one if they've never talked
  const handleSendMessage = (booking: Booking) =>
    router.push(
      booking.participantId
        ? `${messagesHref}?with=${encodeURIComponent(booking.participantId)}`
        : messagesHref
    );

  // Upcoming and pending show the soonest first; past and cancelled the most recent first
  const currentList = bookings
    .filter((b) => b.tab === activeTab)
    .sort((a, b) => {
      const diff = new Date(a.startsAt ?? 0).getTime() - new Date(b.startsAt ?? 0).getTime();
      return activeTab === "upcoming" || activeTab === "pending" ? diff : -diff;
    });

  // Triggering Meeting Flows
  const handleStartMeetingFlow = (booking: Booking) => {
    setSelectedBooking(null);
    setMeetingBooking(booking);
    setMeetingFlow("lobby");
  };

  const handleEnterMeeting = (
    recChoice: RecordingOption,
    _micOn: boolean,
    _cameraOn: boolean,
    token: string,
    serverUrl: string
  ) => {
    setRecordingChoice(recChoice);
    setLivekitToken(token);
    setLivekitServerUrl(serverUrl);
    setMeetingFlow("live_room");
  };

  const handleEndCall = () => {
    stopAllMediaTracks();
    // The room opens 15 minutes early; leaving before the start isn't the end of the session
    const hasStarted =
      !!meetingBooking?.startsAt && new Date(meetingBooking.startsAt).getTime() <= Date.now();
    if (!hasStarted) {
      setMeetingFlow("none");
      setMeetingBooking(null);
      toast("You left the session", {
        description: "You can rejoin from Upcoming until it ends.",
      });
      return;
    }
    setMeetingFlow("review");
  };

  const handleOpenReview = (booking: Booking) => {
    setSelectedBooking(null);
    setMeetingBooking(booking);
    setMeetingFlow("review");
  };

  // Mentees review the session; mentors review the mentee and assign action items
  const handleSubmitReview = async (reviewData: {
    rating: number;
    review: string;
    actionItems: ActionItem[];
    followUpNotes?: string;
  }) => {
    if (!meetingBooking) return;
    try {
      if (isMentor) {
        await submitFeedbackMutation.mutateAsync({
          bookingId: meetingBooking.id,
          rating: reviewData.rating,
          comment: reviewData.review,
          actionItems: reviewData.actionItems,
          followUpNotes: reviewData.followUpNotes,
        });
      } else {
        await createReviewMutation.mutateAsync({
          bookingId: meetingBooking.id,
          rating: reviewData.rating,
          comment: reviewData.review,
        });
      }
      setMeetingFlow("completed");
    } catch (err) {
      showError("We couldn't save your review", err);
    }
  };

  const handleBackToBookings = () => {
    setMeetingFlow("none");
    setMeetingBooking(null);
    setActiveTab("past");
  };

  // Reschedule, cancel and request handlers. Failures surface as errors and leave the booking as it was.
  const handleConfirmReschedule = async (
    bookingId: string,
    startsAt: string,
    _display: { date: string; time: string },
    reason: string
  ) => {
    try {
      await rescheduleBookingMutation.mutateAsync({ id: bookingId, startsAt, reason });
      const name = rescheduleBooking?.participantName;
      setRescheduleBooking(null);
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(null);
      }
      showToast(name ? `Session rescheduled. ${name} has been notified.` : "Session rescheduled.");
    } catch (err) {
      showError("We couldn't reschedule this session", err);
    }
  };

  // Throws on failure so the cancel modal stays on its form instead of showing success
  const handleConfirmCancel = async (bookingId: string, reason: string, note: string) => {
    const fullReason = note.trim() ? `${reason}: ${note.trim()}` : reason;
    try {
      await cancelBookingMutation.mutateAsync({ id: bookingId, reason: fullReason });
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(null);
      }
    } catch (err) {
      showError("We couldn't cancel this session", err);
      throw err;
    }
  };

  const handleAccept = async (booking: Booking) => {
    try {
      await acceptBookingMutation.mutateAsync(booking.id);
      setSelectedBooking(null);
      showToast(`Session confirmed. ${booking.participantName} has been notified.`);
    } catch (err) {
      showError("We couldn't accept this request", err);
    }
  };

  const handleConfirmDecline = async (bookingId: string, reason: string) => {
    try {
      await declineBookingMutation.mutateAsync({ id: bookingId, reason });
      const name = declineBooking?.participantName;
      setDeclineBooking(null);
      setSelectedBooking(null);
      showToast(name ? `Request declined. ${name} will get a full refund.` : "Request declined.");
    } catch (err) {
      showError("We couldn't decline this request", err);
    }
  };

  // If in meeting lobby:
  if (meetingFlow === "lobby" && meetingBooking) {
    return (
      <SessionLobby
        booking={meetingBooking}
        onBack={() => {
          stopAllMediaTracks();
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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[#101828] px-4 py-3 text-xs font-semibold text-white animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="size-4 text-[#12B76A]" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#101828]">Bookings</h1>
        <p className="mt-1 text-sm text-[#667085]">{subtitle}</p>
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
        {isLoading ? (
          <BookingListSkeleton />
        ) : currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#EAECF0] py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#FFF4ED]">
              <Calendar size="28" variant="Bulk" color="#FF5500" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-[#101828]">
              No {activeTab} bookings
            </h3>
            <p className="mt-1 text-xs text-[#667085]">{emptyDescription(activeTab)}</p>
          </div>
        ) : (
          currentList.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              viewerRole={viewerRole}
              onViewDetails={setSelectedBooking}
              onJoinSession={handleStartMeetingFlow}
              onReschedule={setRescheduleBooking}
              onCancel={setCancelBooking}
              onReview={handleOpenReview}
              onAccept={handleAccept}
              onDecline={setDeclineBooking}
              isResponding={
                acceptBookingMutation.isPending && acceptBookingMutation.variables === booking.id
              }
              onSendMessage={handleSendMessage}
            />
          ))
        )}
      </div>

      {/* Booking Details Drawer */}
      <BookingDetailsDrawer
        // The list can update while this is open, so show the latest copy of the booking
        booking={
          selectedBooking
            ? (bookings.find((b) => b.id === selectedBooking.id) ?? selectedBooking)
            : null
        }
        viewerRole={viewerRole}
        onClose={() => setSelectedBooking(null)}
        onJoinSession={(b) => handleStartMeetingFlow(b)}
        onAccept={handleAccept}
        onOpenDecline={(b) => {
          setSelectedBooking(null);
          setDeclineBooking(b);
        }}
        onOpenReschedule={(b) => {
          setSelectedBooking(null);
          setRescheduleBooking(b);
        }}
        onOpenCancel={(b) => {
          setSelectedBooking(null);
          setCancelBooking(b);
        }}
        onOpenReview={handleOpenReview}
        onSendMessage={handleSendMessage}
      />

      {/* Decline Request Modal (mentors) */}
      {declineBooking && (
        <DeclineRequestModal
          booking={declineBooking}
          onClose={() => setDeclineBooking(null)}
          onConfirmDecline={handleConfirmDecline}
        />
      )}

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <RescheduleSessionModal
          booking={rescheduleBooking}
          viewerRole={viewerRole}
          onClose={() => setRescheduleBooking(null)}
          onConfirmReschedule={handleConfirmReschedule}
        />
      )}

      {/* Cancel Modal */}
      {cancelBooking && (
        <CancelSessionModal
          booking={cancelBooking}
          viewerRole={viewerRole}
          onClose={() => setCancelBooking(null)}
          onConfirmCancel={handleConfirmCancel}
        />
      )}

      {/* Session Review Modal (after call or from past tab) */}
      {meetingFlow === "review" && meetingBooking && (
        <SessionReviewModal
          booking={meetingBooking}
          viewerRole={viewerRole}
          isSubmitting={createReviewMutation.isPending || submitFeedbackMutation.isPending}
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
          viewerRole={viewerRole}
          onBackToBookings={handleBackToBookings}
        />
      )}
    </div>
  );
}
