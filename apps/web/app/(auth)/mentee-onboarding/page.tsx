import { Suspense } from "react";
import { MenteeOnboardingPage } from "@/features/auth/mentee-onboarding-page";

export const dynamic = "force-dynamic";

export default function MenteeOnboardingRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#64748b]">Loading onboarding...</div>}>
      <MenteeOnboardingPage />
    </Suspense>
  );
}
