import { Suspense } from "react";
import { AcceptAdminInvitePage } from "@/components/auth/accept-admin-invite-page";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";

export const dynamic = "force-dynamic";

export default async function AcceptAdminInviteRoute({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <Suspense fallback={<AuthFormSkeleton fields={4} label="Loading" />}>
      <AcceptAdminInvitePage token={token} />
    </Suspense>
  );
}
