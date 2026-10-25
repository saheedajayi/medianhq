import { Suspense } from "react";
import { AuthFormSkeleton } from "@/features/auth/auth-form-skeleton";
import { MentorOnboardingPage } from "@/features/auth/mentor-onboarding-page";

export const dynamic = "force-dynamic";

export default function MentorOnboardingRoute() {
  return (
    <Suspense fallback={<AuthFormSkeleton fields={3} label="Loading onboarding" />}>
      <MentorOnboardingPage />
    </Suspense>
  );
}
