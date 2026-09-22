import { redirect } from "next/navigation";

export const metadata = {
  title: "Bookings | Median",
  description: "Review your booked mentor sessions and confirm attendance.",
};

export default function MenteeBookingsPage() {
  redirect("/mentee/booking-session");
}
