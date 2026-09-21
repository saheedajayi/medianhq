import type { Metadata } from "next";
import { LandingPricingPage } from "@/components/landing-page/pricing";

export const metadata: Metadata = {
  title: "Pricing | Median",
  description:
    "Explore Median Pro tiers and transparent session pricing. Keep what's yours and grow your impact.",
};

export default async function PricingPage({ searchParams }: { searchParams: Promise<{ audience?: string }> }) {
  const { audience } = await searchParams;
  return <LandingPricingPage audience={audience === "mentor" ? "mentor" : "mentee"} />;
}
