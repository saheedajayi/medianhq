import { Suspense } from "react";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { MentorSubmittedPage } from "@/components/auth/mentor-submitted-page";

export const dynamic = "force-dynamic";

export default function MentorSubmittedRoute() {
  return (
    <Suspense fallback={<AuthFormSkeleton fields={1} label="Loading" />}>
      <MentorSubmittedPage />
    </Suspense>
  );
}
