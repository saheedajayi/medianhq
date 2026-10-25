import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFormSkeleton } from "@/features/auth/auth-form-skeleton";
import { LoginPage } from "@/features/auth/login-page";

import { createPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Log in",
    description: "Log in to Median to book sessions, message your mentors, and manage your mentorship.",
    path: "/signin",
  }),
  // Overrides the auth layout's noindex
  robots: { index: true, follow: true },
};

export default function LoginRoute() {
  return (
    <Suspense fallback={<AuthFormSkeleton fields={2} label="Loading sign in" />}>
      <LoginPage />
    </Suspense>
  );
}
