import { Suspense } from "react";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { RoleSelectionPage } from "@/components/auth/role-selection-page";

export const dynamic = "force-dynamic";

export default function RoleSelectionRoute() {
  return (
    <Suspense fallback={<AuthFormSkeleton fields={2} label="Loading" />}>
      <RoleSelectionPage />
    </Suspense>
  );
}
