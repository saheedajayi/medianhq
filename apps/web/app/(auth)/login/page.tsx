import { EmptyState } from "@/components/ui/custom/empty-state";

export default function LoginPage() {
  return (
    <EmptyState
      eyebrow="Authentication"
      title="Log in"
      description="The login flow will authenticate mentees, mentors, and admins into the right dashboard."
    />
  );
}
