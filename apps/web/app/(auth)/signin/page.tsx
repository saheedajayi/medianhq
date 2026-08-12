import { Suspense } from "react";
import { LoginPage } from "@/features/auth/login-page";

export const dynamic = "force-dynamic";

export default function LoginRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#64748b]">Loading login...</div>}>
      <LoginPage />
    </Suspense>
  );
}
