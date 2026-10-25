import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFormSkeleton } from "@/features/auth/auth-form-skeleton";
import { SignupPage } from "@/features/auth/signup-page";

import { createPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Create an account",
    description: "Join Median to connect with vetted mentors for 1-on-1 sessions and practical career guidance.",
    path: "/signup",
  }),
  // Overrides the auth layout's noindex
  robots: { index: true, follow: true },
};

export default function SignupRoute() {
  return (
    <Suspense fallback={<AuthFormSkeleton fields={4} label="Loading sign up" />}>
      <SignupPage />
    </Suspense>
  );
}
