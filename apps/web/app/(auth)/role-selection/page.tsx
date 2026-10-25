import { Suspense } from "react";
import { AuthFormSkeleton } from "@/features/auth/auth-form-skeleton";
import { RoleSelectionPage } from "@/features/auth/role-selection-page";

export const dynamic = "force-dynamic";

export default function RoleSelectionRoute() {
  return (
    <Suspense fallback={<AuthFormSkeleton fields={2} label="Loading" />}>
      <RoleSelectionPage />
    </Suspense>
  );
}
