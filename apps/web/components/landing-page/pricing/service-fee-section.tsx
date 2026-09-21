"use client";

import { useState } from "react";
import { CurrencyDropdown, type Currency } from "./currency-dropdown";

interface ServiceFeeSectionProps {
  currency?: Currency;
  onCurrencyChange?: (currency: Currency) => void;
}

export function ServiceFeeSection({
  currency: externalCurrency,
  onCurrencyChange,
}: ServiceFeeSectionProps = {}) {
  const [internalCurrency, setInternalCurrency] = useState<Currency>("NGN");
  const currency = externalCurrency !== undefined ? externalCurrency : internalCurrency;
  const setCurrency = (c: Currency) => {
    if (externalCurrency === undefined) {
      setInternalCurrency(c);
    }
    onCurrencyChange?.(c);
  };

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
        <div className="mt-8 flex justify-center">
          <CurrencyDropdown
            value={currency}
            onChange={setCurrency}
            align="center"
          />
        </div>

        {/* Highlight Fee Pills */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:gap-4">
          {/* Fee Pill 1: Above */}
          <div className="rounded-10 border border-[#EAECF0] bg-[#FFEDE4] p-1">
            <div className="flex h-12 items-center justify-center rounded-lg bg-[#FF5514] px-5 sm:px-6 text-sm text-white transition-all">
              <span>For sessions above </span>
              <span className="ml-1.5 font-bold">
                {currency === "NGN"
                  ? "₦50,000: 10% + ₦800"
                  : "$50: 10% + $1"}
              </span>
            </div>
          </div>

          {/* Fee Pill 2: Below */}
          <div className="rounded-10 border border-[#EAECF0] bg-[#FFEDE4] p-1">
            <div className="flex h-12 items-center justify-center rounded-lg bg-[#FF5514] px-5 sm:px-6 text-sm text-white transition-all">
              <span>For sessions below </span>
              <span className="ml-1.5 font-bold">
                {currency === "NGN"
                  ? "₦50,000: 12% + ₦800"
                  : "$50: 12% + $1"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
