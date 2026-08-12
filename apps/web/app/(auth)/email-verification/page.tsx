import { Suspense } from "react";
import { EmailVerificationPage } from "@/features/auth/email-verification-page";

export const dynamic = "force-dynamic";

export default async function EmailVerificationRoute({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; retryEmail?: string }>;
}) {
  const { email, retryEmail } = await searchParams;

  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#64748b]">Loading verification...</div>}>
      <EmailVerificationPage 
        email={email?.trim() ?? ""} 
        retryEmail={retryEmail === "true"}
      />
    </Suspense>
  );
}
