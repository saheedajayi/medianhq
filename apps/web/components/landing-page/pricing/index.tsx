"use client";

import { LandingHeader, LandingCTABanner, LandingFooter } from "../shared";
import { PricingHero } from "./pricing-hero";
import { PricingTiers } from "./pricing-tiers";
import { PricingInfoCard } from "./pricing-info-card";
import { ServiceFeeSection } from "./service-fee-section";

export function LandingPricingPage() {
  return (
    <main className="min-h-screen bg-white selection:bg-[#FF5514]/15 selection:text-[#FF5514]">
      <LandingHeader />
      <PricingHero />
      <PricingTiers />
      <PricingInfoCard />
      <ServiceFeeSection />
      <LandingCTABanner />
      <LandingFooter />
    </main>
  );
}

export default LandingPricingPage;
