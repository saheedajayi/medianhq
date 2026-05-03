import { EmptyState } from "@/components/ui/custom/empty-state";

export default function AdminUsersPage() {
  return (
    <EmptyState
      eyebrow="Admin"
      title="Users"
      description="Admins will manage mentees, mentors, and internal users here."
    />
  );
}
