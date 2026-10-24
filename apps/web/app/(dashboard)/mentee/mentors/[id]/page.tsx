import { Metadata } from "next";
import { MentorProfileView } from "@/components/mentors/mentor-profile-view";
import { isMockDataEnabled, mentorsDirectory } from "@/mocks";

const USE_MOCKS = isMockDataEnabled("mentorProfile");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const mentor = USE_MOCKS ? mentorsDirectory[id] : undefined;
  if (!mentor) {
    return { title: "Mentor Profile | Median Mentorship" };
  }
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
