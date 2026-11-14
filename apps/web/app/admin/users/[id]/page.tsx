import { UserDetailsView } from "@/components/admin/users/user-details-view";

export default async function AdminUserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserDetailsView userId={id} />;
}
