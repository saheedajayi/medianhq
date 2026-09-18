"use client";

import { LandingHeader } from "./header";
import { LandingHero } from "./home/hero";
import { LandingFeatures } from "./home/features";
import { LandingSteps } from "./home/steps";
import { LandingMentorsShowcase } from "./home/mentors-showcase";
import { LandingProTiers } from "./home/pro-tiers";
import { LandingTestimonials } from "./home/testimonials";
import { LandingFAQ } from "./home/faq";
import { LandingFounderNote } from "./home/founder-note";
import { LandingCTABanner } from "./cta-banner";
import { LandingFooter } from "./footer";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-white selection:bg-[#FF5514]/15 selection:text-[#FF5514]">
      <LandingHeader />
      <LandingHero />
      <LandingFeatures />
      <LandingSteps />
      <LandingMentorsShowcase />
      <LandingProTiers />
      <LandingTestimonials />
      <LandingFAQ />
      <LandingFounderNote />
      <LandingCTABanner />
      <LandingFooter />
    </main>
  );
}

export default LandingPage;
