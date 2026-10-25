import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFormSkeleton } from "@/features/auth/auth-form-skeleton";
import BackofficePage from "@/features/backoffice/waitlist/waitlist-backoffice";

import { noIndexMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = noIndexMetadata;

export default function Page() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md p-8"><AuthFormSkeleton fields={1} label="Loading backoffice" /></div>}>
      <BackofficePage />
    </Suspense>
  );
}
