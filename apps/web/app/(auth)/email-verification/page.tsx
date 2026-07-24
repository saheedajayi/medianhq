import { EmailVerificationPage } from "@/features/auth/email-verification-page";

export default async function EmailVerificationRoute({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <EmailVerificationPage email={email?.trim() ?? ""} />
  );
}
