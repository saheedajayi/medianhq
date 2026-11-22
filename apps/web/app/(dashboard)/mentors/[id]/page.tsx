import { Metadata } from "next";
import { Suspense } from "react";
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

export default async function MentorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // The profile reads ?session= from the URL, which needs a Suspense boundary
  return (
    <Suspense>
      <MentorProfileView mentorId={id} />
    </Suspense>
  );
}
