import { Metadata } from "next";
import { MentorProfileView } from "@/components/mentors/mentor-profile-view";
import { mentorsDirectory, defaultMentorProfile } from "@/components/mentors/mock-profile-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const mentor = mentorsDirectory[id] || defaultMentorProfile;
  return {
    title: `${mentor.name} - ${mentor.role} @ ${mentor.company} | Median Mentorship`,
    description: mentor.bio,
  };
}

export default async function MenteeMentorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MentorProfileView mentorId={id} />;
}
