import { Suspense } from "react";
import { NewPasswordPage } from "@/features/auth/new-password-page";

export const dynamic = "force-dynamic";

export default async function NewPasswordRoute({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#64748b]">Loading...</div>}>
      <NewPasswordPage token={token} />
    </Suspense>
  );
}
