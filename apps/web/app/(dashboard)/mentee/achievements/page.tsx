import { redirect } from "next/navigation";

// Achievements has no designed screen yet and is switched off in the sidebar
export default function MenteeAchievementsPage() {
  redirect("/dashboard");
}
