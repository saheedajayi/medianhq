"use client";

import { useEffect, useState } from "react";
import { isMockDataEnabled, defaultMentorProfile, mentorsDirectory } from "@/mocks";
import { MentorHeroCard } from "./mentor-hero-card";
import { MentorProfileTabs } from "./mentor-profile-tabs";
import { MentorBookingPanel } from "./mentor-booking-panel";
import { MentorNotFoundState } from "./mentor-not-found-state";
import { mapApiMentorProfile } from "./map-mentor-profile";
import { ConfirmSessionModal } from "./modals/confirm-session-modal";
import { PaymentConfirmationModal } from "./modals/payment-confirmation-modal";
import { BookingSuccessModal } from "./modals/booking-success-modal";
import { AvailableDateSlot, MentorDetailProfile, SessionPackage } from "./types";
import { mentorsService } from "@/services/mentors";
import { bookingsService } from "@/services/bookings";

const USE_MOCKS = isMockDataEnabled("mentorProfile");

interface MentorProfileViewProps {
  mentorId: string;
}

const EMPTY_PACKAGE: SessionPackage = {
  id: "",
  title: "",
  durationMinutes: 30,
  price: "Free",
  numericPrice: 0,
  description: "",
};

export function MentorProfileView({ mentorId }: MentorProfileViewProps) {
  const [mentor, setMentor] = useState<MentorDetailProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    mentorsService
      .getById(mentorId)
      .then((res: any) => {
        if (!isMounted) return;
        // Real mentors only ever show their own data
        setMentor(res?.id ? mapApiMentorProfile(res) : null);
      })
      .catch((err) => {
        console.warn("Could not fetch mentor by id from API:", err);
        // Preview data only when the API cannot provide this mentor
        if (isMounted) {
          setMentor(
            USE_MOCKS ? mentorsDirectory[mentorId] || { ...defaultMentorProfile, id: mentorId } : null
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [mentorId]);

  if (isLoading) {
    return (
      <div className="grid w-full grid-cols-1 gap-8 pb-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="h-[520px] animate-pulse rounded-[20px] bg-[#F7F8FB]" />
        <div className="h-[360px] animate-pulse rounded-[20px] bg-[#F7F8FB]" />
      </div>
    );
  }

  if (!mentor) {
    return <MentorNotFoundState />;
  }

  return <MentorProfileContent key={mentor.id} mentor={mentor} />;
}

function MentorProfileContent({ mentor }: { mentor: MentorDetailProfile }) {
  const initialPackage = mentor.packages[0] || EMPTY_PACKAGE;
  const emptyDateSlot: AvailableDateSlot = {
    dateString: "",
    dayOfWeek: "",
    dayNumber: "",
    month: "",
    slotsCount: 0,
    times: [],
  };
  const initialDate =
    mentor.availableDates && mentor.availableDates.length > 0
      ? mentor.availableDates[0]!
      : emptyDateSlot;
  const initialTime = initialDate.times[0] || "";

  // State management
  const [activeTab, setActiveTab] = useState<"profile" | "reviews">("profile");
  const [selectedPackage, setSelectedPackage] = useState<SessionPackage>(initialPackage);
  const [selectedDate, setSelectedDate] = useState<AvailableDateSlot>(initialDate);
  const [selectedTime, setSelectedTime] = useState<string>(initialTime);

  // Modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

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

    setIsSubmittingBooking(true);
    try {
      const startsAtIso = selectedDate.dateString
        ? new Date(`${selectedDate.dateString}T14:00:00Z`).toISOString()
        : new Date(Date.now() + 86400000).toISOString();

      const res = await bookingsService.create({
        mentorId: mentor.id,
        startsAt: startsAtIso,
        durationMinutes: pkg.durationMinutes || 30,
        title: pkg.title,
        price: data.isFree ? 0 : pkg.numericPrice,
        notes: data.scope,
        goals: data.goals ? [data.goals] : [],
      });

      if (res?.booking?.id) {
        setCreatedBookingId(res.booking.id);
      }
    } catch (err) {
      console.warn("Could not save booking to backend API, continuing in preview mode:", err);
    } finally {
      setIsSubmittingBooking(false);
      setIsConfirmOpen(false);

      if (data.isFree) {
        setIsSuccessOpen(true);
      } else {
        setIsPaymentOpen(true);
      }
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
              availableDates={mentor.availableDates}
              groupSessions={mentor.groupSessions}
              selectedPackage={selectedPackage}
              onSelectPackage={setSelectedPackage}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
              onProceedToConfirm={() => setIsConfirmOpen(true)}
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
        onConfirm={handleConfirmSessionSubmit}
      />

      {/* Modal 2: Payment Review & Breakdown */}
      <PaymentConfirmationModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        mentorName={mentor.name}
        selectedPackage={selectedPackage}
        dateTimeDisplay={dateTimeDisplay}
        bookingId={createdBookingId || undefined}
        onPaySuccess={handlePaymentSuccess}
      />

      {/* Modal 3: Booking Success (Free & Paid) */}
      <BookingSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        mentorName={mentor.name}
        selectedPackage={selectedPackage}
        dateSlotDisplay={dateSlotDisplay}
        timeSlotDisplay={selectedTime}
        transactionId="#TXN-2026-0847"
        amountPaidDisplay={`₦${(selectedPackage.numericPrice + Math.round(selectedPackage.numericPrice * 0.1)).toLocaleString()}`}
      />
    </div>
  );
}
