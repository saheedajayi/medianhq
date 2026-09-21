"use client";

import { useState } from "react";
import { LandingHeader, LandingCTABanner, LandingFooter } from "../shared";
import { PricingHero } from "./pricing-hero";
import { PricingTiers } from "./pricing-tiers";
import { PricingInfoCard } from "./pricing-info-card";
import { ServiceFeeSection } from "./service-fee-section";
import type { Currency } from "./currency-dropdown";
import type { LandingAudience } from "../audience";

export function LandingPricingPage({ audience = "mentee" }: { audience?: LandingAudience }) {
  const [currency, setCurrency] = useState<Currency>("NGN");

  return (
    <main className="min-h-screen bg-white selection:bg-[#FF5514]/15 selection:text-[#FF5514]">
      <LandingHeader />
      <PricingHero />
      <PricingTiers audience={audience} currency={currency} onCurrencyChange={setCurrency} />
      <PricingInfoCard />
      <ServiceFeeSection currency={currency} onCurrencyChange={setCurrency} />
      <LandingCTABanner />
      <LandingFooter />
    </main>
  );
}

export default LandingPricingPage;
