import { EmptyState } from "@/components/ui/custom/empty-state";

export default function DashboardPage() {
  return (
    <EmptyState
      eyebrow="Dashboard"
      title="Role-based home"
      description="This route will redirect users to the correct mentee, mentor, or admin workspace after login."
    />
  );
}
