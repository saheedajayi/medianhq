import { EmailVerificationPage } from "@/features/auth/email-verification-page";

export default async function EmailVerificationRoute({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; retryEmail?: string }>;
}) {
  const { email, retryEmail } = await searchParams;

  return (
    <EmailVerificationPage 
      email={email?.trim() ?? ""} 
      retryEmail={retryEmail === "true"}
    />
  );
}
