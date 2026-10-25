import { Suspense } from "react";
import { AuthFormSkeleton } from "@/features/auth/auth-form-skeleton";
import { EmailVerificationPage } from "@/features/auth/email-verification-page";

export const dynamic = "force-dynamic";

export default async function EmailVerificationRoute({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; retryEmail?: string }>;
}) {
  const { email, retryEmail } = await searchParams;

  return (
    <Suspense fallback={<AuthFormSkeleton fields={1} label="Loading verification" />}>
      <EmailVerificationPage 
        email={email?.trim() ?? ""} 
        retryEmail={retryEmail === "true"}
      />
    </Suspense>
  );
}
