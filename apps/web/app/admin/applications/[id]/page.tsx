import { ApplicationReviewView } from "@/components/admin/applications/application-review-view";

export default async function AdminApplicationReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApplicationReviewView applicationId={id} />;
}
