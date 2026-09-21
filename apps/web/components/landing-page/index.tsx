"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LandingHeader, LandingCTABanner, LandingFooter } from "./shared";
import { LandingHero } from "./home/hero";
import { LandingFeatures } from "./home/features";
import { LandingSteps } from "./home/steps";
import { LandingMentorsShowcase } from "./home/mentors-showcase";
import { LandingProTiers } from "./home/pro-tiers";
import { LandingTestimonials } from "./home/testimonials";
import { LandingFAQ } from "./home/faq";
import { LandingFounderNote } from "./home/founder-note";
import { MentorFeatures } from "./mentor/features";
import { MentorSteps } from "./mentor/steps";
import type { LandingAudience } from "./audience";

export function LandingPage({ initialAudience = "mentee" }: { initialAudience?: LandingAudience }) {
  const [audience, setAudience] = useState<LandingAudience>(initialAudience);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const syncAudience = () => {
      setAudience(new URLSearchParams(window.location.search).get("audience") === "mentor" ? "mentor" : "mentee");
    };
    syncAudience();
    window.addEventListener("popstate", syncAudience);
    return () => window.removeEventListener("popstate", syncAudience);
  }, []);

  const changeAudience = (nextAudience: LandingAudience) => {
    if (nextAudience === audience) return;
    const url = new URL(window.location.href);
    if (nextAudience === "mentor") url.searchParams.set("audience", "mentor");
    else url.searchParams.delete("audience");
    window.history.pushState(null, "", url);
    window.scrollTo({ top: 0, behavior: "auto" });
    setAudience(nextAudience);
  };

  return (
    <main className="min-h-screen bg-white selection:bg-[#FF5514]/15 selection:text-[#FF5514]">
      <LandingHeader />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={audience}
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -20 }}
          transition={{ duration: reducedMotion ? 0 : 0.3, ease: "easeInOut" }}
        >
          <LandingHero audience={audience} onAudienceChange={changeAudience} />
          {audience === "mentor" ? (
            <>
              <MentorFeatures />
              <MentorSteps />
            </>
          ) : (
            <>
              <LandingFeatures />
              <LandingSteps />
              <LandingMentorsShowcase />
            </>
          )}
          <LandingProTiers audience={audience} />
          {audience === "mentee" && <LandingTestimonials />}
          <LandingFAQ audience={audience} />
          <LandingFounderNote />
          <LandingCTABanner />
          <LandingFooter onAudienceChange={changeAudience} />
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

export default LandingPage;
