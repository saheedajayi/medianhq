import { LandingFooter, LandingHeader, LandingPageHero } from "../shared";
import { NoOpenings } from "./no-openings";

export function LandingCareersPage() {
  return (
    <main className="min-h-screen bg-white selection:bg-[#FF5514]/15 selection:text-[#FF5514]">
      <LandingHeader showNav />
      <LandingPageHero title="Careers" />
      <NoOpenings />
      <LandingFooter />
    </main>
  );
}
