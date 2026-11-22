import { redirect } from "next/navigation";

// Community has no designed screen yet and is switched off in the sidebar
export default function MenteeCommunityPage() {
  redirect("/dashboard");
}
