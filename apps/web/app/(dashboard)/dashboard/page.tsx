import { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getSessionHint } from "@/lib/session-hint";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  return <DashboardView sessionHint={await getSessionHint()} />;
}
