import { Suspense } from "react";
import { AuthFormSkeleton } from "@/features/auth/auth-form-skeleton";
import { MenteeOnboardingPage } from "@/features/auth/mentee-onboarding-page";

export const dynamic = "force-dynamic";

export default function MenteeOnboardingRoute() {
  return (
    <Suspense fallback={<AuthFormSkeleton fields={3} label="Loading onboarding" />}>
      <MenteeOnboardingPage />
    </Suspense>
  );
}
