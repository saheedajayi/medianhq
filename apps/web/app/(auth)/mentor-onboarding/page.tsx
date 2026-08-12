import { Suspense } from "react";
import { MentorOnboardingPage } from "@/features/auth/mentor-onboarding-page";

export default function MentorOnboardingRoute() {
  return (
    <Suspense fallback={null}>
      <MentorOnboardingPage />
    </Suspense>
  );
}
