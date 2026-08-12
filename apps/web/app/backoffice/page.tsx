import { Suspense } from "react";
import BackofficePage from "@/features/backoffice/waitlist/waitlist-backoffice";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#64748b]">Loading backoffice...</div>}>
      <BackofficePage />
    </Suspense>
  );
}
