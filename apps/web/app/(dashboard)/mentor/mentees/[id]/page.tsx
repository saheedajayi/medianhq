import { Metadata } from "next";
import { MenteeProfileView } from "@/components/mentees/mentee-profile-view";

export const metadata: Metadata = {
  title: "Mentee Profile",
  description: "View the profile of a mentee who booked a session with you.",
};

export default async function MentorMenteeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MenteeProfileView menteeId={id} />;
}
