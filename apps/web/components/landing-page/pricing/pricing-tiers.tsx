"use client";

import { useState } from "react";
import Link from "next/link";
import { TickCircle, CloseCircle } from "iconsax-react";
import { motion } from "framer-motion";
import { CurrencyDropdown, type Currency } from "./currency-dropdown";
import type { LandingAudience } from "../audience";
import { BILLING_PERIOD, PRO_PRICES, type BillingCycle } from "./plan-prices";

const BILLING_OPTIONS: { id: BillingCycle; label: string; badge?: string }[] = [
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "annually", label: "Annually", badge: "(save 20%)" },
];

interface PricingTiersProps {
  audience?: LandingAudience;
  currency?: Currency;
  onCurrencyChange?: (currency: Currency) => void;
}

export function PricingTiers({
  audience = "mentee",
  currency: externalCurrency,
  onCurrencyChange,
}: PricingTiersProps = {}) {
  const [internalCurrency, setInternalCurrency] = useState<Currency>("NGN");
  const currency = externalCurrency !== undefined ? externalCurrency : internalCurrency;
  const setCurrency = (c: Currency) => {
    if (externalCurrency === undefined) {
      setInternalCurrency(c);
    }
    onCurrencyChange?.(c);
  };

  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const proSubtitle = () => {
    if (billingCycle === "annually") return "Billed yearly";
    if (billingCycle === "quarterly") return "Billed quarterly";
    return "Billed monthly";
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

  const mentorFreeFeatures = [
    { text: "Create a mentor profile", included: true },
    { text: "Set your availability", included: true },
    { text: "Offer free and paid sessions", included: true },
    { text: "Receive session earnings in your Median wallet", included: true },
  ];

  const mentorProFeatures = [
    { text: "Everything in Free", included: true },
    { text: "Premium mentor features", included: true },
    { text: "Reduced paid session service charges", included: true },
    { text: "Payouts in supported currencies", included: true },
  ];

  const displayedFreeFeatures = audience === "mentor" ? mentorFreeFeatures : freeTierFeatures;
  const displayedProFeatures = audience === "mentor" ? mentorProFeatures : menteeProFeatures;

  return (
    <section className="relative w-full bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#101828] sm:text-4xl lg:text-[44px] leading-tight">
            Start free. Grow on your terms.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-[#475467] sm:text-lg">
            Every plan is designed to give you real value at every stage — whether
            you&apos;re just starting or going all in.
          </p>
        </div>

        {/* Controls Bar: Currency Selector & Billing Cycle Toggle */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
          {/* Currency Dropdown */}
          <CurrencyDropdown
            value={currency}
            onChange={setCurrency}
            align="left"
          />

          {/* Billing Cycle Pill Toggle with sliding animation */}
          <div className="relative flex h-[52px] items-center rounded-10 border border-[#FCD5C5] bg-[#FFF4ED] p-1.5 text-sm">
            {BILLING_OPTIONS.map((option) => {
              const isActive = billingCycle === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setBillingCycle(option.id)}
                  className={`relative h-full flex items-center justify-center rounded-lg px-5 text-sm font-semibold transition-colors duration-200 focus:outline-none cursor-pointer ${
                    isActive
                      ? "text-white"
                      : "text-[#344054] font-medium hover:text-[#101828]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeBillingCyclePill"
                      className="absolute inset-0 rounded-lg bg-[#FF5514] shadow-xs"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span>{option.label}</span>
                    {option.badge && (
                      <span
                        className={`transition-colors duration-200 ${
                          isActive
                            ? "text-white font-semibold"
                            : "text-[#FF5514] font-semibold"
                        }`}
                      >
                        {audience === "mentor" ? "(annual savings)" : option.badge}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10">
          {/* Card 1: Free */}
          <div className="group flex flex-col justify-between rounded-[28px] border border-[#F2F2F7] bg-[#FFFCF8] p-7 sm:p-9 transition-all duration-300 hover:border-[#FF5514]">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#101828]">Free</h3>
              </div>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#101828]">
                  {currency === "NGN" ? "₦0" : "$0"}
                </span>
                <span className="text-base font-normal text-[#667085]">/month</span>
              </div>
              <p className="mt-3 text-base text-[#667085]">Forever free</p>

              <hr className="my-6 border-[#F2F2F7]" />

              {/* Features List */}
              <ul className="space-y-3.5 text-sm">
                {displayedFreeFeatures.map((f, i) => (
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
                className="flex h-12 w-full items-center justify-center rounded-full border border-[#FF8D62] bg-white text-base font-semibold !text-[#E84D12] transition-all hover:border-[#FF5514] hover:bg-[#FFF5EE] active:scale-[0.99]"
              >
                Get started
              </Link>
            </div>
          </div>

          {/* Paid plan for the selected audience */}
          <div className="group relative flex flex-col justify-between rounded-[28px] border border-[#F2F2F7] bg-[#FFFCF8] p-7 sm:p-9 transition-all duration-300 hover:border-[#FF5514]">
            <div>
              {/* Header */}
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-[#101828]">{audience === "mentor" ? "Mentor Pro" : "Mentee Pro"}</h3>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF8D62] bg-white px-3.5 py-1 text-xs font-semibold text-[#E84D12]">
                  <span className="size-1.5 rounded-full bg-[#E84D12]" />
                  Coming soon
                </span>
              </div>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#101828]">
                  {PRO_PRICES[audience][billingCycle][currency]}
                </span>
                <span className="text-base font-normal text-[#667085]">
                  {BILLING_PERIOD[billingCycle]}
                </span>
              </div>
              <p className="mt-3 text-base text-[#667085]">
                {proSubtitle()}
              </p>

              <hr className="my-6 border-[#F2F2F7]" />

              {/* Features List */}
              <ul className="space-y-3.5 text-sm text-[#0C111D]/80">
                {displayedProFeatures.map((f, i) => (
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
                href={audience === "mentor" ? "/signup?role=mentor" : "/signup?role=mentee"}
                className="flex h-12 w-full items-center justify-center rounded-full bg-[#FF5514] text-base font-semibold !text-white transition-all hover:bg-[#E84D12] active:scale-[0.99]"
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
