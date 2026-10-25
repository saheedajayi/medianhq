import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/page-metadata";
import { LandingPricingPage } from "@/components/landing-page/pricing";

export const metadata: Metadata = createPageMetadata({
  title: "Pricing",
  description:
    "Explore Median Pro tiers and transparent session pricing. Keep what's yours and grow your impact.",
  path: "/pricing",
});

export default async function PricingPage({ searchParams }: { searchParams: Promise<{ audience?: string }> }) {
  const { audience } = await searchParams;
  return <LandingPricingPage audience={audience === "mentor" ? "mentor" : "mentee"} />;
}
