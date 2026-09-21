import Image from "next/image";
import { LandingBenefitCard } from "../shared/benefit-card";

const benefits = [
  {
    title: "One on one sessions",
    description:
      "Connect directly with your mentees through personalized sessions designed to provide guidance, share expertise, and support their growth.",
    color: "bg-[#EDE6E6]",
    position: "lg:absolute lg:left-[12%] lg:top-[11%]",
  },
  {
    title: "Become a thought leader",
    description:
      "Share your expertise, inspire the next generation, and build your influence by guiding ambitious minds toward success.",
    color: "bg-[#FFEEE8]",
    position: "lg:absolute lg:right-[4%] lg:top-[4%]",
  },
  {
    title: "Earning potential",
    description:
      "Turn your experience into income while helping others grow. Expand your impact and earn more as you mentor.",
    color: "bg-[#FFEEE8]",
    position: "lg:absolute lg:left-[4%] lg:bottom-[12%]",
  },
  {
    title: "Opportunity to give back",
    description:
      "Make an impact by guiding someone toward their potential. Be the mentor you once wished you had.",
    color: "bg-[#EDE6E6]",
    position: "lg:absolute lg:right-[3%] lg:bottom-[23%]",
  },
];

export function MentorFeatures() {
  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto hidden h-[1000px] w-full max-w-[1360px] lg:block">
          <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[632px] w-[746px] -translate-x-1/2 -translate-y-1/2">
            <Image src="/landing-page/what-you-get.png" alt="" fill sizes="746px" className="object-contain opacity-[0.08]" />
          </div>
          <div className="absolute top-[47%] left-1/2 z-10 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 px-4 text-center">
            <h2 className="text-[42px] leading-[1.18] font-bold tracking-tight text-[#101828]">
              What you get when you <br /> join median
            </h2>
          </div>
          <div className="absolute top-[3%] left-[4%] z-10 h-[275px] w-[245px] overflow-hidden rounded-[20px] shadow-sm">
            <Image src="/landing-page/mentor-call.png" alt="Mentor meeting with a mentee" fill sizes="245px" className="object-cover" />
          </div>
          <div className="absolute right-[16%] bottom-[4%] z-10 h-[280px] w-[250px] overflow-hidden rounded-[20px] shadow-sm">
            <Image src="/landing-page/mentor-mentoring.png" alt="Mentor guiding a professional" fill sizes="250px" className="object-cover" />
          </div>
          {benefits.map((benefit) => <LandingBenefitCard key={benefit.title} title={benefit.title} description={benefit.description} color={benefit.color} className={benefit.position} />)}
        </div>

        <div className="lg:hidden">
          <div className="relative mx-auto max-w-xl py-10 text-center">
            <Image src="/landing-page/what-you-get.png" alt="" width={260} height={220} className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.08]" />
            <h2 className="relative text-3xl font-bold tracking-tight text-[#101828] sm:text-4xl">
              What you get when you <br /> join median
            </h2>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="relative h-48 overflow-hidden rounded-2xl sm:col-span-2">
              <Image src="/landing-page/mentor-call.png" alt="Mentor meeting with a mentee" fill sizes="(min-width: 640px) 720px, 100vw" className="object-cover" />
            </div>
            {benefits.map((benefit) => <LandingBenefitCard key={benefit.title} title={benefit.title} description={benefit.description} color={benefit.color} />)}
            <div className="relative h-48 overflow-hidden rounded-2xl sm:col-span-2">
              <Image src="/landing-page/mentor-mentoring.png" alt="Mentor guiding a professional" fill sizes="(min-width: 640px) 720px, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
