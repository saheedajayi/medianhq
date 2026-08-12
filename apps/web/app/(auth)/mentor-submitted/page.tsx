import { Suspense } from "react";
import { MentorSubmittedPage } from "@/features/auth/mentor-submitted-page";

export const dynamic = "force-dynamic";

export default function MentorSubmittedRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#64748b]">Loading...</div>}>
      <MentorSubmittedPage />
    </Suspense>
  );
}
