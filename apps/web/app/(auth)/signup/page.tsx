import { Suspense } from "react";
import { SignupPage } from "@/features/auth/signup-page";

export const dynamic = "force-dynamic";

export default function SignupRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#64748b]">Loading signup...</div>}>
      <SignupPage />
    </Suspense>
  );
}
