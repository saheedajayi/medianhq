import { Suspense } from "react";
import { AuthFormSkeleton } from "@/features/auth/auth-form-skeleton";
import { MentorSubmittedPage } from "@/features/auth/mentor-submitted-page";

export const dynamic = "force-dynamic";

export default function MentorSubmittedRoute() {
  return (
    <Suspense fallback={<AuthFormSkeleton fields={1} label="Loading" />}>
      <MentorSubmittedPage />
    </Suspense>
  );
}
