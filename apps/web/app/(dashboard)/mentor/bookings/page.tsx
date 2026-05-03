import { EmptyState } from "@/components/ui/custom/empty-state";

export default function MentorBookingsPage() {
  return (
    <EmptyState
      eyebrow="Mentor"
      title="Session requests"
      description="Mentors will review confirmed sessions, completed sessions, and booking history here."
    />
  );
}
