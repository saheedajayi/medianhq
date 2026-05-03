import { EmptyState } from "@/components/ui/custom/empty-state";

export default function MenteeBookingsPage() {
  return (
    <EmptyState
      eyebrow="Mentee"
      title="My bookings"
      description="Mentees will track upcoming, completed, and cancelled mentorship sessions here."
    />
  );
}
