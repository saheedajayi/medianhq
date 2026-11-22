import { redirect } from "next/navigation";

// A mentee's profile is edited in Settings; this used to land on Community
export default function MenteeProfilePage() {
  redirect("/settings?tab=account");
}
