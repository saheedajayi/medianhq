import { EmptyState } from "@/components/ui/custom/empty-state";

export default function AdminBookingsPage() {
  return (
    <EmptyState
      eyebrow="Admin"
      title="Bookings"
      description="Admins will monitor paid bookings, cancellations, disputes, and completion status here."
    />
  );
}
