import { EmptyState } from "@/components/ui/custom/empty-state";

export default function RegisterPage() {
  return (
    <EmptyState
      eyebrow="Authentication"
      title="Create an account"
      description="The registration flow will collect account details and route users into mentee or mentor onboarding."
    />
  );
}
