import { Suspense } from "react";
import { MentorOnboardingPage } from "@/features/auth/mentor-onboarding-page";

export const dynamic = "force-dynamic";

export default function MentorOnboardingRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#64748b]">Loading onboarding...</div>}>
      <MentorOnboardingPage />
    </Suspense>
  );
}
