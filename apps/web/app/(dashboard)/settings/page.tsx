import { Metadata } from "next";
import { Suspense } from "react";
import { SettingsView } from "@/components/settings/settings-view";
import { MenteeSettingsView } from "@/components/settings/mentee/mentee-settings-view";
import { MentorSettingsView } from "@/components/settings/mentor/mentor-settings-view";
import { getSessionHint } from "@/lib/session-hint";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const { role } = await getSessionHint();

  // Every view reads ?tab= from the URL, which needs a Suspense boundary.
  // Admins keep the plain security page.
  return (
    <Suspense>
      {role === "MENTEE" ? (
        <MenteeSettingsView />
      ) : role === "MENTOR" ? (
        <MentorSettingsView />
      ) : (
        <SettingsView />
      )}
    </Suspense>
  );
}
