import { Suspense } from "react";
import { BookingsView } from "@/components/bookings/bookings-view";
export const metadata = { title: "Booking session", description: "Review your mentor booking sessions." };
export default function MenteeBookingSessionPage() {
  return (
    <Suspense>
      <BookingsView viewerRole="mentee" />
    </Suspense>
  );
}
