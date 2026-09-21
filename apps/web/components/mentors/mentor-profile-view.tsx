"use client";

import { useState } from "react";
import { defaultMentorProfile, mentorsDirectory } from "./mock-profile-data";
import { MentorHeroCard } from "./mentor-hero-card";
import { MentorProfileTabs } from "./mentor-profile-tabs";
import { MentorBookingPanel } from "./mentor-booking-panel";
import { ConfirmSessionModal } from "./modals/confirm-session-modal";
import { PaymentConfirmationModal } from "./modals/payment-confirmation-modal";
import { BookingSuccessModal } from "./modals/booking-success-modal";
import { AvailableDateSlot, SessionPackage } from "./types";

interface MentorProfileViewProps {
  mentorId: string;
}

export function MentorProfileView({ mentorId }: MentorProfileViewProps) {
  const mentor = mentorsDirectory[mentorId] || {
    ...defaultMentorProfile,
    id: mentorId,
  };

  const initialPackage = mentor.packages[0] || defaultMentorProfile.packages[0]!;
  const initialDate = mentor.availableDates[0] || defaultMentorProfile.availableDates[0]!;
  const initialTime = initialDate.times[0] || "03:00PM";

  // State management
  const [activeTab, setActiveTab] = useState<"profile" | "reviews">("profile");
  const [selectedPackage, setSelectedPackage] = useState<SessionPackage>(initialPackage);
  const [selectedDate, setSelectedDate] = useState<AvailableDateSlot>(initialDate);
  const [selectedTime, setSelectedTime] = useState<string>(initialTime);

  // Modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Formatted date string for modals
  const dateSlotDisplay = new Date(`${selectedDate.dateString}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const dateTimeDisplay = `${dateSlotDisplay} - ${selectedTime} WAT`;

  // Step 1: User completes session goals & submits
  const handleConfirmSessionSubmit = () => {
    setIsConfirmOpen(false);
    if (selectedPackage.numericPrice === 0) {
      // Free booking -> straight to success
      setIsSuccessOpen(true);
    } else {
      // Paid booking -> to payment breakdown modal
      setIsPaymentOpen(true);
    }
  };

  // Step 2: Payment completed
  const handlePaymentSuccess = () => {
    setIsPaymentOpen(false);
    setIsSuccessOpen(true);
  };

  return (
    <div className="rounded-2xl border border-[#EAECF0] bg-white p-5 pb-16 sm:p-7">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <MentorHeroCard mentor={mentor} />
          <MentorProfileTabs
            mentor={mentor}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        <div className="lg:col-span-5">
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
