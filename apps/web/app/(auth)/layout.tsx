import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthShell } from "@/features/auth/auth-shell";
import { noIndexMetadata } from "@/lib/page-metadata";

// Account flows stay out of search; sign-in and sign-up opt back in on their own pages
export const metadata: Metadata = noIndexMetadata;

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
