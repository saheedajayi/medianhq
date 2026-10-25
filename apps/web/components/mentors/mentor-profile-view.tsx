"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MentorHeroCard } from "./mentor-hero-card";
import { MentorProfileTabs } from "./mentor-profile-tabs";
import { MentorBookingPanel } from "./mentor-booking-panel";
import { MentorNotFoundState } from "./mentor-not-found-state";
import { mapApiMentorProfile } from "./map-mentor-profile";
import { MentorProfileSkeleton } from "./mentor-profile-skeleton";
import { ConfirmSessionModal } from "./modals/confirm-session-modal";
import { PaymentConfirmationModal } from "./modals/payment-confirmation-modal";
import { BookingSuccessModal } from "./modals/booking-success-modal";
import { AvailableDateSlot, MentorDetailProfile, SessionPackage } from "./types";
import { useMentor } from "@/services/mentors/queries/mentors.queries";
import {
  useCreateBooking,
  useMentorAvailability,
  useMyBookings,
} from "@/services/bookings/queries/bookings.queries";
import { getSlotIso, toAvailableDateSlots } from "@/components/bookings/available-slots";


interface MentorProfileViewProps {
  mentorId: string;
}

const EMPTY_DATE_SLOT: AvailableDateSlot = {
  dateString: "",
  dayOfWeek: "",
  dayNumber: "",
  month: "",
  slotsCount: 0,
  times: [],
};

const EMPTY_PACKAGE: SessionPackage = {
  id: "",
  title: "",
  durationMinutes: 30,
  price: "Free",
  numericPrice: 0,
  description: "",
};

export function MentorProfileView({ mentorId }: MentorProfileViewProps) {
  const { data, isLoading } = useMentor(mentorId);

  const mentor = useMemo<MentorDetailProfile | null>(
    () => (data?.id ? mapApiMentorProfile(data) : null),
    [data]
  );

  if (isLoading) {
    return <MentorProfileSkeleton />;
  }

  if (!mentor) {
    return <MentorNotFoundState />;
  }

  return <MentorProfileContent key={mentor.id} mentor={mentor} />;
}

function MentorProfileContent({ mentor }: { mentor: MentorDetailProfile }) {
  const initialPackage = mentor.packages[0] || EMPTY_PACKAGE;

  // State management
  const [activeTab, setActiveTab] = useState<"profile" | "reviews">("profile");
  const [selectedPackage, setSelectedPackage] = useState<SessionPackage>(initialPackage);
  const [selectedDate, setSelectedDate] = useState<AvailableDateSlot>(EMPTY_DATE_SLOT);
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Open slots depend on the session length, so they reload when the package changes
  const { data: availableDays, isLoading: isLoadingDates } = useMentorAvailability(
    mentor.mentorUserId,
    selectedPackage.durationMinutes
  );
  const availableDates = useMemo(() => toAvailableDateSlots(availableDays), [availableDays]);

  // Keep the picked date and time valid as slots load or get taken
  useEffect(() => {
    const stillOpen = availableDates.find((d) => d.dateString === selectedDate.dateString);
    if (stillOpen && stillOpen.times.includes(selectedTime)) {
      if (stillOpen !== selectedDate) setSelectedDate(stillOpen);
      return;
    }
    const nextDate = stillOpen ?? availableDates[0] ?? EMPTY_DATE_SLOT;
    setSelectedDate(nextDate);
    setSelectedTime(nextDate.times[0] ?? "");
  }, [availableDates, selectedDate, selectedTime]);

  // Modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  // The slot that was booked: booking refreshes the open slots, which moves the picker on
  const [bookedSlot, setBookedSlot] = useState<{ date: string; time: string } | null>(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const createBookingMutation = useCreateBooking();

  // Formatted date string for modals
  const dateSlotDisplay = selectedDate.dateString
    ? new Date(`${selectedDate.dateString}T12:00:00`).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";
  const dateTimeDisplay = `${dateSlotDisplay} - ${selectedTime} WAT`;

  // Step 1: User completes session goals & submits
  // A mentee can't book the same session again until their current one has ended
  const { data: myBookings } = useMyBookings();
  const activeBooking = (myBookings ?? []).find(
    (b) =>
      (b.tab === "upcoming" || b.tab === "pending") &&
      b.mentorId === mentor.mentorUserId &&
      (b.mentorSessionId ?? null) === (selectedPackage.mentorSessionId ?? null)
  );
  const existingBooking = activeBooking
    ? {
        when: activeBooking.fullDateTime,
        href: `/mentee/booking-session?tab=${activeBooking.tab}`,
      }
    : null;

  // Validate the slot when "Book Session" is clicked, before asking for goals
  const handleProceedToConfirm = () => {
    if (existingBooking) return;
    if (!getSlotIso(selectedDate, selectedTime)) {
      toast.error("Pick a time", { description: "Choose one of the open slots to continue." });
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmSessionSubmit = async (data: {
    scope: string;
    goals: string;
    isFree: boolean;
    packageToUse?: SessionPackage;
  }) => {
    const pkg = data.packageToUse || selectedPackage;
    if (data.packageToUse) {
      setSelectedPackage(data.packageToUse);
    }

    // Checked before the confirm modal opens; this guards against the slot list changing meanwhile
    const startsAt = getSlotIso(selectedDate, selectedTime);
    if (!startsAt) {
      setIsConfirmOpen(false);
      toast.error("Pick a time", { description: "Choose one of the open slots to continue." });
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const res = await createBookingMutation.mutateAsync({
        mentorId: mentor.mentorUserId ?? mentor.id,
        mentorSessionId: pkg.mentorSessionId ?? undefined,
        startsAt,
        notes: data.scope,
        goals: data.goals ? [data.goals] : [],
      });

      setCreatedBookingId(res.booking?.id ?? null);
      setBookedSlot({ date: dateSlotDisplay, time: selectedTime });
      setIsConfirmOpen(false);
      // Free sessions go straight to the mentor; paid ones go to checkout first
      if (pkg.numericPrice > 0) {
        setIsPaymentOpen(true);
      } else {
        setIsSuccessOpen(true);
      }
    } catch (err) {
      const message = (err as { message?: string })?.message;
      toast.error("We couldn't book that session", {
        description: message || "Please try again, or pick another time.",
      });
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Step 2: Payment completed
  const handlePaymentSuccess = () => {
    setIsPaymentOpen(false);
    setIsSuccessOpen(true);
  };

  return (
    <div className="w-full flex-1 flex flex-col pb-16">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <MentorHeroCard mentor={mentor} />
          <MentorProfileTabs
            mentor={mentor}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        <div>
          <div className="sticky top-6">
            <MentorBookingPanel
              packages={mentor.packages}
              availableDates={availableDates}
              isLoadingDates={isLoadingDates}
              existingBooking={existingBooking}
              groupSessions={mentor.groupSessions}
              selectedPackage={selectedPackage}
              onSelectPackage={setSelectedPackage}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
              onProceedToConfirm={handleProceedToConfirm}
            />
          </div>
        </div>
      </div>

      {/* Modal 1: Confirm Session Scope & Goals */}
      <ConfirmSessionModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        mentorName={mentor.name}
        packages={mentor.packages}
        selectedPackage={selectedPackage}
        dateTimeDisplay={dateTimeDisplay}
        isLoading={isSubmittingBooking}
        onConfirm={handleConfirmSessionSubmit}
      />

      {/* Modal 2: Payment Review & Breakdown */}
      <PaymentConfirmationModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        mentorName={mentor.name}
        selectedPackage={selectedPackage}
        dateTimeDisplay={bookedSlot ? `${bookedSlot.date} - ${bookedSlot.time} WAT` : dateTimeDisplay}
        bookingId={createdBookingId || undefined}
        onPaySuccess={handlePaymentSuccess}
      />

      {/* Modal 3: Booking Success (Free & Paid) */}
      <BookingSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        mentorName={mentor.name}
        selectedPackage={selectedPackage}
        dateSlotDisplay={bookedSlot?.date ?? dateSlotDisplay}
        timeSlotDisplay={bookedSlot?.time ?? selectedTime}
      />
    </div>
  );
}
