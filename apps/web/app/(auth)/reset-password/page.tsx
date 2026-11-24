import { Suspense } from "react";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { ResetPasswordPage } from "@/components/auth/reset-password-page";

export const dynamic = "force-dynamic";

export default function ResetPasswordRoute() {
  return (
    <Suspense fallback={<AuthFormSkeleton fields={1} label="Loading" />}>
      <ResetPasswordPage />
    </Suspense>
  );
}
