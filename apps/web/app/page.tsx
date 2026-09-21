import { LandingPage } from "@/components/landing-page";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ audience?: string }>;
}) {
  const { audience } = await searchParams;
  return <LandingPage initialAudience={audience === "mentor" ? "mentor" : "mentee"} />;
}
