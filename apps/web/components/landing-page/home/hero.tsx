"use client";

import Link from "next/link";
import { CompanyCarousel } from "../shared/company-carousel";
import type { LandingAudience } from "../audience";

export function LandingHero({
  audience,
  onAudienceChange,
}: {
  audience: LandingAudience;
  onAudienceChange: (audience: LandingAudience) => void;
}) {
  const isMentor = audience === "mentor";

  return (
    <section
      className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20"
      style={{
        background: "linear-gradient(180deg, #FFDFD4 0%, #FFECE5 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Headline */}
        <div className="mx-auto max-w-4xl text-center">
          {isMentor ? (
            <h1 className="font-playfair text-4xl font-black tracking-tight text-[#101828] sm:text-5xl md:text-6xl lg:text-7xl">
              Your experience matters
              <br />
              <span className="italic text-[#FF5514]">pass it on.</span>
            </h1>
          ) : (
            <h1 className="font-playfair text-4xl font-black tracking-tight text-[#101828] sm:text-5xl md:text-6xl lg:text-7xl">
              Meet the mentor who
              <br />
              <span className="italic text-[#FF5514]">changes everything.</span>
            </h1>
          )}

          <p className="mx-auto mt-6 max-w-2xl text-base text-[#475467] sm:text-lg">
            {isMentor
              ? "Become a vetted mentor. Connect 1:1 with ambitious people who could use your experience, perspective, and guidance to move forward."
              : "Vetted experts. Real advice. Free to start. The mentorship platform built for ambitious African professionals."}
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            {isMentor ? (
              <Link
                href="/signup?role=mentor"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#FF5514] px-8 text-sm font-semibold !text-white shadow-sm transition-all hover:bg-[#e84d12] sm:w-auto"
              >
                Get Started <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/signup?role=mentee"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#FF5514] px-8 text-sm font-semibold !text-white shadow-sm transition-all hover:bg-[#e84d12] sm:w-auto"
                >
                  Find a mentor
                </Link>
                <button
                  type="button"
                  onClick={() => onAudienceChange("mentor")}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#FF5514] bg-white px-8 text-sm font-semibold text-[#FF5514] shadow-2xs transition-all hover:bg-[#FFF5F1] active:scale-[0.98] sm:w-auto"
                >
                  Become a mentor
                </button>
              </>
            )}
          </div>
        </div>

        {/* <CompanyCarousel /> */}
      </div>
    </section>
  );
}
