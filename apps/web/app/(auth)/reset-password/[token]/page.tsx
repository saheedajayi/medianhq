import { NewPasswordPage } from "@/features/auth/new-password-page";

export default async function NewPasswordRoute({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  
  return <NewPasswordPage token={token} />;
}
