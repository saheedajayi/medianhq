"use client";

import { useState } from "react";
import { ArrowDown2 } from "iconsax-react";

type Currency = "NGN" | "USD";

export function ServiceFeeSection() {
  const [currency, setCurrency] = useState<Currency>("NGN");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <section className="relative w-full bg-[#FFFAF5] py-20 sm:py-28 text-center">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-[#101828] sm:text-4xl">
          Paid-session service charge fee
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#475467] sm:text-base">
          A small fee applies to each paid session. Mentors can choose to
          absorb, split or pass it on to mentees
        </p>

        {/* Currency Dropdown Selector */}
        <div className="relative mt-8 inline-block">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex h-11 items-center gap-3 rounded-2xl border border-[#EAECF0] bg-white px-4 text-sm font-semibold text-[#101828] shadow-2xs transition-all hover:bg-[#FFF5EE]"
          >
            {currency === "NGN" ? (
              <div className="flex h-4 w-5 overflow-hidden rounded-xs border border-black/10">
                <span className="h-full w-1/3 bg-[#008751]" />
                <span className="h-full w-1/3 bg-white" />
                <span className="h-full w-1/3 bg-[#008751]" />
              </div>
            ) : (
              <span className="text-base">🇺🇸</span>
            )}
            <span>{currency}</span>
            <ArrowDown2 size={16} color="#101828" variant="Linear" />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 z-20 mt-2 w-36 overflow-hidden rounded-xl border border-[#EAECF0] bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setCurrency("NGN");
                  setIsDropdownOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#FFFAF5] ${
                  currency === "NGN" ? "font-bold text-[#FF5514]" : "text-[#344054]"
                }`}
              >
                <div className="flex h-3.5 w-5 overflow-hidden rounded-xs border border-black/10">
                  <span className="h-full w-1/3 bg-[#008751]" />
                  <span className="h-full w-1/3 bg-white" />
                  <span className="h-full w-1/3 bg-[#008751]" />
                </div>
                NGN (₦)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrency("USD");
                  setIsDropdownOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#FFFAF5] ${
                  currency === "USD" ? "font-bold text-[#FF5514]" : "text-[#344054]"
                }`}
              >
                <span>🇺🇸</span>
                USD ($)
              </button>
            </div>
          )}
        </div>

        {/* Highlight Fee Pills */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:gap-4">
          <div className="inline-flex items-center justify-center rounded-xl bg-[#FF5514] px-6 py-3.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#E84D12]">
            {currency === "NGN"
              ? "For sessions above ₦50,000: 10% + ₦800"
              : "For sessions above $50: 10% + $1"}
          </div>
          <div className="inline-flex items-center justify-center rounded-xl bg-[#FF5514] px-6 py-3.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#E84D12]">
            {currency === "NGN"
              ? "For sessions below ₦50,000: 12% + ₦800"
              : "For sessions below $50: 12% + $1"}
          </div>
        </div>
      </div>
    </section>
  );
}
