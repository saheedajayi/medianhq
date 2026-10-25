import { Metadata } from "next";
import { Suspense } from "react";
import { BookingsView } from "@/components/bookings/bookings-view";

export const metadata: Metadata = {
  title: "Bookings",
  description: "Manage your sessions with mentees.",
};

// BookingsView reads ?tab= from the URL, which needs a Suspense boundary
export default function MentorBookingsPage() {
  return (
    <Suspense>
      <BookingsView viewerRole="mentor" />
    </Suspense>
  );
}
