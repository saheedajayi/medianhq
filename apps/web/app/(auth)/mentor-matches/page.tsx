import { Suspense } from "react";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { MentorMatchesPage } from "@/components/auth/mentor-matches-page";

export const dynamic = "force-dynamic";

export default function MentorMatchesRoute() {
  return (
    <Suspense fallback={<AuthFormSkeleton fields={3} label="Loading matches" />}>
      <MentorMatchesPage />
    </Suspense>
  );
}
