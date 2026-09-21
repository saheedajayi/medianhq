"use client";

import Link from "next/link";
import type { LandingAudience } from "../audience";
import { BILLING_PERIOD, PRO_PRICES, type BillingCycle } from "../pricing/plan-prices";

const mentorCycles: BillingCycle[] = ["monthly", "quarterly", "annually"];

export function LandingProTiers({ audience = "mentee" }: { audience?: LandingAudience }) {
  return (
    <section className="relative w-full bg-[#FFFAF5] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        {/* Header */}
        <h3 className="text-2xl font-semibold text-[#FF5514] sm:text-3xl">
          Median Pro Tiers
        </h3>
        <h2 className="mt-3 text-lg font-normal tracking-tight text-[#101828] sm:text-xl lg:text-2xl">
          Choose your subscription. Get paid in your currency.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-[#475467] sm:text-base leading-relaxed">
          {audience === "mentor"
            ? "Upgrade to Mentor Pro to unlock premium features and receive your session earnings directly from your Median wallet — with transparent pricing, flexible subscriptions, and payouts in 20+ currencies."
            : "Upgrade to Mentee Pro or Mentor Pro, unlock premium features, and receive your session earnings directly from your Median wallet — with transparent pricing, flexible subscriptions, and payouts in 20+ currencies."}
        </p>

        {/* Badges / Tier Highlights */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {audience === "mentor" ? mentorCycles.map((cycle) => (
            <span key={cycle} className="inline-flex items-center gap-1.5 rounded-full border border-[#FFD9A8] bg-[#FFD9A84D] px-4 py-2 text-xs font-medium text-[#344054] sm:text-sm">
              <span className="text-[#FF5514]">✓</span>
              Mentor Pro: {PRO_PRICES.mentor[cycle].NGN} / {PRO_PRICES.mentor[cycle].USD}{BILLING_PERIOD[cycle]}
            </span>
          )) : (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFCAB6] bg-[#FF551426] px-4 py-2 text-xs font-medium text-[#344054] sm:text-sm">
                <span className="text-[#FF5514]">✓</span> Mentee Pro: {PRO_PRICES.mentee.monthly.NGN}/month
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFD9A8] bg-[#FFD9A84D] px-4 py-2 text-xs font-medium text-[#344054] sm:text-sm">
                <span className="text-[#FF5514]">✓</span> Mentor Pro: {PRO_PRICES.mentor.monthly.NGN}/month
              </span>
            </>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-8 sm:mt-10">
          <Link
            href={audience === "mentor" ? "/pricing?audience=mentor" : "/pricing"}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#FF5514] px-8 text-sm sm:text-base font-semibold !text-white shadow-xs transition-all hover:bg-[#E84D12] active:scale-[0.98]"
          >
            Explore Median pro plans
          </Link>
        </div>
      </div>
    </section>
  );
}
