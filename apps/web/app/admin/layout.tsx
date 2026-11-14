import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/shared/admin-shell";
import { noIndexMetadata } from "@/lib/page-metadata";
import { getSessionHint } from "@/lib/session-hint";

export const metadata: Metadata = noIndexMetadata;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role } = await getSessionHint();
  return <AdminShell isAdminHint={role === "ADMIN"}>{children}</AdminShell>;
}
