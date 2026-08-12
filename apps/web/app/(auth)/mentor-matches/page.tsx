import { Suspense } from "react";
import { MentorMatchesPage } from "@/features/auth/mentor-matches-page";

export const dynamic = "force-dynamic";

export default function MentorMatchesRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#64748b]">Loading matches...</div>}>
      <MentorMatchesPage />
    </Suspense>
  );
}
