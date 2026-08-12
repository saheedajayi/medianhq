import { Suspense } from "react";
import { SignupPage } from "@/features/auth/signup-page";

export default function SignupRoute() {
  return (
    <Suspense fallback={null}>
      <SignupPage />
    </Suspense>
  );
}
