import { Metadata } from "next";
import { Suspense } from "react";
import { SettingsView } from "@/components/settings/settings-view";
import { MenteeSettingsView } from "@/components/settings/mentee/mentee-settings-view";
import { getSessionHint } from "@/lib/session-hint";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const { role } = await getSessionHint();

  // Mentors keep the existing page until their settings designs arrive
  if (role !== "MENTEE") return <SettingsView />;

  // The view reads ?tab= from the URL, which needs a Suspense boundary
  return (
    <Suspense>
      <MenteeSettingsView />
    </Suspense>
  );
}
