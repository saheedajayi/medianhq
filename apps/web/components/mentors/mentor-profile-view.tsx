"use client";

import { useEffect, useState } from "react";
import { defaultMentorProfile, mentorsDirectory } from "./mock-profile-data";
import { MentorHeroCard } from "./mentor-hero-card";
import { MentorProfileTabs } from "./mentor-profile-tabs";
import { MentorBookingPanel } from "./mentor-booking-panel";
import { ConfirmSessionModal } from "./modals/confirm-session-modal";
import { PaymentConfirmationModal } from "./modals/payment-confirmation-modal";
import { BookingSuccessModal } from "./modals/booking-success-modal";
import { AvailableDateSlot, MentorDetailProfile, SessionPackage } from "./types";
import { mentorsService } from "@/services/mentors";
import { bookingsService } from "@/services/bookings";

interface MentorProfileViewProps {
  mentorId: string;
}

export function MentorProfileView({ mentorId }: MentorProfileViewProps) {
  const fallbackMentor = mentorsDirectory[mentorId] || {
    ...defaultMentorProfile,
    id: mentorId,
  };

  const [mentor, setMentor] = useState<MentorDetailProfile>(fallbackMentor);

  useEffect(() => {
    let isMounted = true;
    mentorsService
      .getById(mentorId)
      .then((res: any) => {
        if (!isMounted || !res) return;
        setMentor((prev) => ({
          ...prev,
          id: res.id || prev.id,
          name: res.name || prev.name,
          role: res.role || prev.role,
          company: res.company || prev.company,
          location: res.location || prev.location,
          sessionCount: res.sessionCount ?? prev.sessionCount,
          rating: res.rating ?? prev.rating,
          reviewCount: res.reviewCount ?? prev.reviewCount,
          bio: res.bio || prev.bio,
          avatarUrl: res.avatarUrl || prev.avatarUrl,
          socials: {
            ...prev.socials,
            linkedin: res.linkedinUrl || prev.socials.linkedin,
          },
          reviews: Array.isArray(res.reviews) && res.reviews.length > 0 ? res.reviews : prev.reviews,
        }));
      })
      .catch((err) => {
        console.warn("Could not fetch mentor by id from API, using fallback data:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [mentorId]);

  const initialPackage = mentor.packages[0] || defaultMentorProfile.packages[0]!;
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
