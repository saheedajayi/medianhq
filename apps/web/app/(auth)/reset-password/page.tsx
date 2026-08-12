import { Suspense } from "react";
import { ResetPasswordPage } from "@/features/auth/reset-password-page";

export const dynamic = "force-dynamic";

export default function ResetPasswordRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#64748b]">Loading...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
