import { Suspense } from "react";
import { RoleSelectionPage } from "@/features/auth/role-selection-page";

export const dynamic = "force-dynamic";

export default function RoleSelectionRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#64748b]">Loading...</div>}>
      <RoleSelectionPage />
    </Suspense>
  );
}
