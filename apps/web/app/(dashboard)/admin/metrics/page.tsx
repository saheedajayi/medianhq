import { EmptyState } from "@/components/ui/custom/empty-state";

export default function AdminMetricsPage() {
  return (
    <EmptyState
      eyebrow="Admin"
      title="MVP metrics"
      description="Admins will track approved mentors, mentees, completed sessions, revenue, repeat bookings, and NPS here."
    />
  );
}
