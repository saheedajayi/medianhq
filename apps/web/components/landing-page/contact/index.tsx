import { LandingFAQ } from "../home/faq";
import { LandingCTABanner, LandingFooter, LandingHeader, LandingPageHero } from "../shared";
import { ContactDetails } from "./contact-details";
import { ContactForm } from "./contact-form";
import { CONTACT_FAQ_OPEN, CONTACT_FAQ_QUESTIONS } from "./contact-utils";

export function LandingContactPage() {
  return (
    <main className="min-h-screen bg-white selection:bg-[#FF5514]/15 selection:text-[#FF5514]">
      <LandingHeader showNav />
      <LandingPageHero title="Contact Us" />

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <ContactDetails />
        <ContactForm />
      </section>

      <LandingFAQ tone="warm" questions={CONTACT_FAQ_QUESTIONS} defaultOpen={CONTACT_FAQ_OPEN} />
      <LandingCTABanner />
      <LandingFooter />
    </main>
  );
}
