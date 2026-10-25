import { Suspense } from "react";
import { AuthFormSkeleton } from "@/features/auth/auth-form-skeleton";
import { MentorMatchesPage } from "@/features/auth/mentor-matches-page";

export const dynamic = "force-dynamic";

export default function MentorMatchesRoute() {
  return (
    <Suspense fallback={<AuthFormSkeleton fields={3} label="Loading matches" />}>
      <MentorMatchesPage />
    </Suspense>
  );
}
