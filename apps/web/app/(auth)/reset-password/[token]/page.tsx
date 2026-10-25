import { Suspense } from "react";
import { AuthFormSkeleton } from "@/features/auth/auth-form-skeleton";
import { NewPasswordPage } from "@/features/auth/new-password-page";

export const dynamic = "force-dynamic";

export default async function NewPasswordRoute({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  
  return (
    <Suspense fallback={<AuthFormSkeleton fields={2} label="Loading" />}>
      <NewPasswordPage token={token} />
    </Suspense>
  );
}
