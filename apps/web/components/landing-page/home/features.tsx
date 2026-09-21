"use client";

import Image from "next/image";
import { LandingBenefitCard } from "../shared/benefit-card";

export function LandingFeatures() {
  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-8">
        {/* Desktop / Tablet Orbital Layout */}
        <div className="relative mx-auto hidden lg:block h-[1000px] w-full max-w-[1360px]">
          {/* 1. Center Watermark Shape */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none z-0"
            style={{ width: "746px", height: "632px" }}
          >
            <Image
              src="/landing-page/what-you-get.png"
              alt=""
              width={746}
              height={632}
              className="h-full w-full object-contain opacity-[0.08]"
              priority
            />
          </div>

          {/* 2. Center Headline */}
          <div className="absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2 z-20 text-center w-full max-w-2xl px-4">
            <h2 className="text-3xl font-bold tracking-tight text-[#101828] sm:text-4xl lg:text-[42px] leading-[1.18]">
              What you get when you <br />
              join median
            </h2>
          </div>

          {/* 3. Top-Left: AI Image & Card */}
          {/* AI Image */}
          <div
            className="absolute left-[4%] top-[3%] z-10 overflow-hidden rounded-[20px] shadow-sm"
            style={{ width: "245px", height: "275px" }}
          >
            <Image
              src="/landing-page/ai-matching.png"
              alt="AI Matching"
              fill
              className="object-cover"
            />
          </div>

          <LandingBenefitCard
            title="AI Powered Matching"
            description="Semantic goal-based matching. We Surface mentors who've walked your exact path, with a one-line explanation of why they fit."
            color="bg-[#EDE6E6]"
            className="lg:absolute lg:left-[12%] lg:top-[11%]"
          />

          <LandingBenefitCard
            title="One-on-One Live Calls"
            description="Turn your questions into actionable insights with dedicated live sessions tailored to your journey."
            color="bg-[#FFEEE8]"
            className="lg:absolute lg:right-[4%] lg:top-[4%]"
          />

          <LandingBenefitCard
            title="Async QnA"
            description="Send questions to your mentor anytime and receive personalized guidance at your convenience."
            color="bg-[#FFEEE8]"
            className="lg:absolute lg:left-[4%] lg:bottom-[12%]"
          />

          {/* 6. Bottom-Right: Vetted Experts Only Card & Photo */}
          {/* Mentee Photo */}
          <div
            className="absolute right-[16%] bottom-[4%] z-10 overflow-hidden rounded-[20px] shadow-sm"
            style={{ width: "250px", height: "280px" }}
          >
            <Image
              src="/landing-page/vetted-experts.png"
              alt="Vetted Experts"
              fill
              className="object-cover"
            />
          </div>

          <LandingBenefitCard
            title="Vetted Experts Only"
            description="Gain access to accomplished professionals selected for their expertise and real-world experience."
            color="bg-[#EDE6E6]"
            className="lg:absolute lg:right-[3%] lg:bottom-[23%]"
          />
        </div>

        {/* Mobile / Small Screen Responsive Layout */}
        <div className="lg:hidden">
          {/* Section Heading with Watermark Background */}
          <div className="relative mx-auto max-w-xl text-center py-10">
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none z-0 w-64 h-56">
              <Image
                src="/landing-page/what-you-get.png"
                alt=""
                width={746}
                height={632}
                className="h-full w-full object-contain opacity-[0.08]"
              />
            </div>
            <h2 className="relative z-10 text-3xl font-bold tracking-tight text-[#101828] sm:text-4xl">
              What you get when you <br />
              join median
            </h2>
          </div>

          {/* Stacked Cards */}
          <div className="mt-8 space-y-6">
            {/* Card 1: AI Powered Matching */}
            <div className="overflow-hidden rounded-2xl bg-[#EDE6E6] p-6 shadow-sm">
              <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl">
                <Image
                  src="/landing-page/ai-matching.png"
                  alt="AI Matching"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-[#101828]">
                AI Powered Matching
              </h3>
              <p className="mt-2 text-sm text-[#475467] leading-relaxed">
                Semantic goal-based matching. We Surface mentors who&apos;ve walked your exact path, with a one-line explanation of why they fit.
              </p>
            </div>

            {/* Card 2: One-on-One Live Calls */}
            <div className="rounded-2xl bg-[#FFEEE8] p-6 shadow-sm">
              <h3 className="text-xl font-bold text-[#101828]">
                One-on-One Live Calls
              </h3>
              <p className="mt-2 text-sm text-[#475467] leading-relaxed">
                Turn your questions into actionable insights with dedicated live sessions tailored to your journey.
              </p>
            </div>

            {/* Card 3: Async QnA */}
            <div className="rounded-2xl bg-[#FFEEE8] p-6 shadow-sm">
              <h3 className="text-xl font-bold text-[#101828]">
                Async QnA
              </h3>
              <p className="mt-2 text-sm text-[#475467] leading-relaxed">
                Send questions to your mentor anytime and receive personalized guidance at your convenience.
              </p>
            </div>

            {/* Card 4: Vetted Experts Only */}
            <div className="overflow-hidden rounded-2xl bg-[#EDE6E6] p-6 shadow-sm">
              <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl">
                <Image
                  src="/landing-page/vetted-experts.png"
                  alt="Vetted Experts"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-[#101828]">
                Vetted Experts Only
              </h3>
              <p className="mt-2 text-sm text-[#475467] leading-relaxed">
                Gain access to accomplished professionals selected for their expertise and real-world experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
