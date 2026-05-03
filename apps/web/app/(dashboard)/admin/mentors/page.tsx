import { EmptyState } from "@/components/ui/custom/empty-state";

export default function AdminMentorsPage() {
  return (
    <EmptyState
      eyebrow="Admin"
      title="Mentor approvals"
      description="Admins will approve, reject, and audit mentor applications here."
    />
  );
}
