import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { noIndexMetadata } from "@/lib/page-metadata";
import { getSessionHint } from "@/lib/session-hint";

export const metadata: Metadata = noIndexMetadata;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = await getSessionHint();
  return <DashboardShell initialRole={role}>{children}</DashboardShell>;
}
