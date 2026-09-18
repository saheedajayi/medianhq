"use client";

import Link from "next/link";

export function LandingCTABanner() {
  return (
    <section className="relative overflow-hidden bg-[#4E0703] py-24 sm:py-32 text-white">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* Main Title */}
        <h2 className="font-playfair mx-auto max-w-4xl text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl leading-[1.15]">
          Your network is{" "}
          <span className="italic text-[#FF5514]">
            not
          </span>
          <br />
          your limit.
        </h2>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-xl text-base text-white/85 sm:text-lg leading-relaxed">
          Join thousands of professionals
          <br />
          building the careers they actually want.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
          <Link
            href="/signup?role=mentee"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#FF5514] px-8 text-base font-semibold text-white shadow-xs transition-all hover:bg-[#E84D12] active:scale-[0.98] sm:w-auto"
          >
            Find a mentor
          </Link>
          <Link
            href="/signup?role=mentor"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-8 !text-[#E84D12] border border-[#E84D12] font-semibold shadow-xs transition-all hover:bg-[#FFFAF5] active:scale-[0.98] sm:w-auto"
          >
            Apply as a mentor
          </Link>
        </div>
      </div>
    </section>
  );
}
