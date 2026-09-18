"use client";

export function PricingInfoCard() {
  return (
    <section className="relative w-full bg-white pb-20 sm:pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-[#F7F8FB] p-8 sm:p-12 md:p-14">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:gap-12">
            {/* Column 1: Service Fee Options */}
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-[#FF5514] sm:text-2xl">
                Service Fee Options
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[#344054] sm:text-base">
                Mentors can decide whether to absorb Medians&apos;s service fees,
                split or pass them on to mentees. If you choose to pass on the
                fees, the full session price will be paid directly to you. You
                will find this setting when logged in, under Sessions → Payout.
              </p>
            </div>

            {/* Column 2: Transparent Service Charges */}
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-[#FF5514] sm:text-2xl">
                Transparent Service Charges
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[#344054] sm:text-base">
                Median keeps booking fees simple and visible. For paid sessions up
                to ₦50,000, the service charge is 10% + ₦800 or 8% + $1. For
                bookings above ₦50,000, the service charge is 12% + ₦800 or 10% +
                $1. Fees are shown clearly before payment so mentors and mentees
                know exactly what applies.
              </p>
            </div>

            {/* Column 3: Multi-Currency Payments & Payouts */}
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-[#FF5514] sm:text-2xl">
                Multi-Currency Payments & Payouts
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[#344054] sm:text-base">
                Mentees can pay in supported currencies, while mentors can
                receive earnings through their Median wallet and withdraw to
                supported bank accounts or payout methods. This makes it easier to
                mentor and get paid across borders without managing separate
                payment arrangements.
              </p>
              <p className="mt-5 text-sm font-medium text-[#101828] sm:text-base">
                Local and cross-border payments
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#475467]">
                Payout in NGN are received within 24 hours or instantly while
                other currencies take up to 4-5 working days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
