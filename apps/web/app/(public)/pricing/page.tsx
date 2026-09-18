import type { Metadata } from "next";
import { LandingPricingPage } from "@/components/landing-page/pricing";

export const metadata: Metadata = {
  title: "Pricing | Median",
  description:
    "Explore Median Pro tiers and transparent session pricing. Keep what's yours and grow your impact.",
};

export default function PricingPage() {
  return <LandingPricingPage />;
}
