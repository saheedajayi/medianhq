import { redirect } from "next/navigation";

export const metadata = {
  title: "Bookings",
  description: "Review your sessions with mentors.",
};

export default function MenteeBookingsPage() {
  redirect("/mentee/booking-session");
}
