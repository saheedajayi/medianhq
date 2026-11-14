import { EmptyState } from "@/components/ui/custom/empty-state";

/** Any admin address without a page yet shows its name instead of a 404 */
export default async function AdminPlaceholderPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const name = decodeURIComponent(slug[0] ?? "").replace(/[-_]+/g, " ").trim();
  return <EmptyState title={name ? name.charAt(0).toUpperCase() + name.slice(1) : "Admin"} />;
}
