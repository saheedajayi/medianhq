"use client";

import { useState } from "react";
import Link from "next/link";
import { TickCircle, CloseCircle, ArrowDown2 } from "iconsax-react";

type Currency = "NGN" | "USD";
type BillingCycle = "monthly" | "quarterly" | "annually";

export function PricingTiers() {
  const [currency, setCurrency] = useState<Currency>("NGN");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  // Price calculations
  const menteeProPrice = () => {
    if (currency === "NGN") {
      if (billingCycle === "annually") return "₦4,000";
      if (billingCycle === "quarterly") return "₦4,500";
      return "₦5,000";
    } else {
      if (billingCycle === "annually") return "$5.50";
      if (billingCycle === "quarterly") return "$6.20";
      return "$7";
    }
  };

  const freeTierFeatures = [
    { text: "Browse a limited mentor pool", included: true },
    { text: "3 curated match every 60-90 days", included: true },
    { text: "A “Read-only” Community access", included: true },
    { text: "Up to 2 free sessions per month", included: true },
    { text: "Up to 3 paid sessions per month", included: true },
    { text: "Public blog/Community content", included: true },
    { text: "Personal career roadmap", included: false },
    { text: "Progress dashboard", included: false },
    { text: "Priority matching", included: false },
  ];

  const menteeProFeatures = [
    { text: "Everything in Free", included: true },
    { text: "Unlimited curated matches", included: true },
    { text: "Unlimited paid and free sessions", included: true },
    { text: "Advanced filters by industry, company & seniority", included: true },
    { text: "Full booking access", included: true },
    { text: "Personal career roadmap", included: true },
    { text: "Progress dashboard", included: true },
    { text: "Masterclasses, resume reviews, mock interviews", included: true },
    { text: "Full community access", included: true },
  ];

  return (
    <section className="relative w-full bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#101828] sm:text-4xl lg:text-[44px] leading-tight">
            Start free. Grow on your terms.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-[#475467] sm:text-lg">
            Every plan is designed to give you real value at every stage — whether
            you&apos;re just starting or going all in.
          </p>
        </div>

        {/* Controls Bar: Currency Selector & Billing Cycle Toggle */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          {/* Currency Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
              className="inline-flex h-12 items-center gap-3 rounded-2xl border border-[#EAECF0] bg-[#FF5514]/[0.08] px-4 text-sm font-semibold text-[#101828] transition-all hover:bg-[#FF5514]/[0.12]"
            >
              {currency === "NGN" ? (
                <div className="flex h-5 w-6 overflow-hidden rounded-xs border border-black/10">
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

            {isCurrencyDropdownOpen && (
              <div className="absolute left-0 z-20 mt-2 w-36 overflow-hidden rounded-xl border border-[#EAECF0] bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setCurrency("NGN");
                    setIsCurrencyDropdownOpen(false);
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
                    setIsCurrencyDropdownOpen(false);
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

          {/* Billing Cycle Pill Toggle */}
          <div className="flex items-center rounded-2xl border border-[#EAECF0] bg-[#FF5514]/[0.08] p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-xl px-4 py-2 transition-all ${
                billingCycle === "monthly"
                  ? "bg-[#FF5514] font-semibold text-white shadow-xs"
                  : "text-[#475467] hover:text-[#101828]"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("quarterly")}
              className={`rounded-xl px-4 py-2 transition-all ${
                billingCycle === "quarterly"
                  ? "bg-[#FF5514] font-semibold text-white shadow-xs"
                  : "text-[#475467] hover:text-[#101828]"
              }`}
            >
              Quarterly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annually")}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition-all ${
                billingCycle === "annually"
                  ? "bg-[#FF5514] font-semibold text-white shadow-xs"
                  : "text-[#475467] hover:text-[#101828]"
              }`}
            >
              <span>Annually</span>
              <span
                className={`text-xs ${
                  billingCycle === "annually" ? "text-white/90 font-bold" : "text-[#FF5514] font-semibold"
                }`}
              >
                (save 20%)
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10">
          {/* Card 1: Free */}
          <div className="group flex flex-col justify-between rounded-[28px] border border-[#F2F2F7] bg-[#FFFCF8] p-7 sm:p-9 shadow-xs transition-all duration-300 hover:border-[#FF5514] hover:shadow-md">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#101828]">Free</h3>
              </div>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[#101828] sm:text-5xl">
                  {currency === "NGN" ? "₦0" : "$0"}
                </span>
                <span className="text-sm font-normal text-[#667085]">/month</span>
              </div>
              <p className="mt-1 text-sm text-[#667085]">Forever free</p>

              <hr className="my-6 border-[#F2F2F7]" />

              {/* Features List */}
              <ul className="space-y-3.5 text-sm">
                {freeTierFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {f.included ? (
                      <TickCircle
                        size={20}
                        color="#34C759"
                        variant="Bold"
                        className="shrink-0"
                      />
                    ) : (
                      <CloseCircle
                        size={20}
                        color="#D0D5DD"
                        variant="Linear"
                        className="shrink-0"
                      />
                    )}
                    <span className={f.included ? "text-[#0C111D]/80" : "text-[#98A2B3]"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Paid Session Service Charge Subsection */}
              <div className="mt-6 pt-4 border-t border-[#F2F2F7]">
                <h4 className="text-sm font-bold text-[#101828]">
                  Paid session service charge:
                </h4>
                <ul className="mt-3 space-y-2.5 text-sm text-[#0C111D]/80">
                  <li className="flex items-center gap-3">
                    <TickCircle
                      size={20}
                      color="#34C759"
                      variant="Bold"
                      className="shrink-0"
                    />
                    <span>
                      {currency === "NGN"
                        ? "Up to ₦50,000: 10% + ₦800"
                        : "Up to $50: 10% + $1"}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <TickCircle
                      size={20}
                      color="#34C759"
                      variant="Bold"
                      className="shrink-0"
                    />
                    <span>
                      {currency === "NGN"
                        ? "Above ₦50,000: 12% + ₦800"
                        : "Above $50: 12% + $1"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 pt-2">
              <Link
                href="/signup"
                className="flex h-12 w-full items-center justify-center rounded-full border border-[#FF8D62] bg-white text-base font-semibold text-[#E84D12] transition-all hover:border-[#FF5514] hover:bg-[#FFF5EE] active:scale-[0.99]"
              >
                Get started
              </Link>
            </div>
          </div>

          {/* Card 2: Mentee Pro */}
          <div className="group relative flex flex-col justify-between rounded-[28px] border border-[#F2F2F7] bg-[#FFFCF8] p-7 sm:p-9 shadow-xs transition-all duration-300 hover:border-[#FF5514] hover:shadow-md">
            <div>
              {/* Header */}
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-[#101828]">Mentee Pro</h3>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF8D62] bg-white px-3.5 py-1 text-xs font-semibold text-[#E84D12] shadow-2xs">
                  <span className="size-1.5 rounded-full bg-[#E84D12]" />
                  Coming soon
                </span>
              </div>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[#101828] sm:text-5xl">
                  {menteeProPrice()}
                </span>
                <span className="text-sm font-normal text-[#667085]">/month</span>
              </div>
              <p className="mt-1 text-sm text-[#667085]">
                {billingCycle === "monthly"
                  ? "Billed monthly"
                  : billingCycle === "quarterly"
                  ? "Billed quarterly"
                  : "Billed annually"}
              </p>

              <hr className="my-6 border-[#F2F2F7]" />

              {/* Features List */}
              <ul className="space-y-3.5 text-sm text-[#0C111D]/80">
                {menteeProFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <TickCircle
                      size={20}
                      color="#34C759"
                      variant="Bold"
                      className="shrink-0"
                    />
                    <span className="text-[#0C111D]/80">{f.text}</span>
                  </li>
                ))}
              </ul>

              {/* Reduced Paid Session Service Charge Subsection */}
              <div className="mt-6 pt-4 border-t border-[#F2F2F7]">
                <h4 className="text-sm font-bold text-[#101828]">
                  Reduced paid session service charge:
                </h4>
                <ul className="mt-3 space-y-2.5 text-sm text-[#0C111D]/80">
                  <li className="flex items-center gap-3">
                    <TickCircle
                      size={20}
                      color="#34C759"
                      variant="Bold"
                      className="shrink-0"
                    />
                    <span>
                      {currency === "NGN"
                        ? "Up to ₦50,000: 8% + ₦800"
                        : "Up to $50: 8% + $1"}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <TickCircle
                      size={20}
                      color="#34C759"
                      variant="Bold"
                      className="shrink-0"
                    />
                    <span>
                      {currency === "NGN"
                        ? "Above ₦50,000: 10% + ₦800"
                        : "Above $50: 10% + $1"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 pt-2">
              <Link
                href="/signup?role=mentee"
                className="flex h-12 w-full items-center justify-center rounded-full bg-[#FF5514] text-base font-semibold !text-white shadow-xs transition-all hover:bg-[#E84D12] active:scale-[0.99]"
              >
                Notify me when it&apos;s live
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
