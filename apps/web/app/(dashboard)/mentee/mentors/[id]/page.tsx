import { Metadata } from "next";
import { MentorProfileView } from "@/components/mentors/mentor-profile-view";
import { getMentorMetadata } from "@/components/mentors/mentor-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return getMentorMetadata(id);
}

export default async function MenteeMentorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MentorProfileView mentorId={id} />;
}
