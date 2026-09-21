"use client";

import Image from "next/image";

type LogoVariant = "compact" | "medium" | "wide";

interface CompanyLogo {
  name: string;
  src: string;
  variant: LogoVariant;
}

const COMPANIES: CompanyLogo[] = [
  { name: "Remita", src: "/landing-page/company/remita.png", variant: "wide" },
  { name: "Flutterwave", src: "/landing-page/company/flutterwave.png", variant: "wide" },
  { name: "Lotus Bank", src: "/landing-page/company/lotus-bank.png", variant: "compact" },
  { name: "Open Access Data Center", src: "/landing-page/company/open-access-data-center.png", variant: "medium" },
  { name: "VFD Microfinance Bank", src: "/landing-page/company/vfd-bank.png", variant: "compact" },
  { name: "Risevest", src: "/landing-page/company/risevest.png", variant: "wide" },
  { name: "PwC", src: "/landing-page/company/pwc.png", variant: "medium" },
  { name: "Moniepoint", src: "/landing-page/company/moniepoint.png", variant: "wide" },
  { name: "EY", src: "/landing-page/company/ey.svg", variant: "compact" },
  { name: "Paystack", src: "/landing-page/company/paystack.png", variant: "wide" },
  { name: "Microsoft", src: "/landing-page/company/microsoft.svg", variant: "wide" },
  { name: "Google", src: "/landing-page/company/google.svg", variant: "compact" },
  { name: "Andela", src: "/landing-page/company/andela.svg", variant: "compact" },
  { name: "KPMG", src: "/landing-page/company/kpmg.svg", variant: "medium" },
  { name: "Deloitte", src: "/landing-page/company/deloitte.svg", variant: "wide" },
  { name: "Goldman Sachs", src: "/landing-page/company/goldmansachs.svg", variant: "medium" },
  { name: "Barclays", src: "/landing-page/company/barclays.svg", variant: "compact" },
  { name: "Rolls Royce", src: "/landing-page/company/rollsroyce.svg", variant: "compact" },
  { name: "Apple", src: "/landing-page/company/apple.svg", variant: "compact" },
  { name: "Netflix", src: "/landing-page/company/netflix.svg", variant: "compact" },
  { name: "Cowrywise", src: "/landing-page/company/cowrywise.svg", variant: "wide" },
  { name: "Interswitch", src: "/landing-page/company/interswitch.svg", variant: "wide" },
  { name: "Visa", src: "/landing-page/company/visa.svg", variant: "wide" },
  { name: "Mastercard", src: "/landing-page/company/mastercard.svg", variant: "compact" },
  { name: "IHS", src: "/landing-page/company/ihs.svg", variant: "wide" },
  { name: "Ilorin Innovation Hub", src: "/landing-page/company/ilorin-innovation-hub.svg", variant: "wide" },
  { name: "LSETF", src: "/landing-page/company/lsetf.png", variant: "medium" },
  { name: "Lagos Business School", src: "/landing-page/company/lagos-business-school.png", variant: "medium" },
  { name: "TechCabal", src: "/landing-page/company/techcabal.png", variant: "wide" },
  { name: "ALX", src: "/landing-page/company/alx.svg", variant: "medium" },
  { name: "Autogon AI", src: "/landing-page/company/autogon-ai.png", variant: "wide" },
  { name: "Zoho", src: "/landing-page/company/zoho.svg", variant: "medium" },
  { name: "FirstBank", src: "/landing-page/company/firstbank.svg", variant: "wide" },
  { name: "Sterling Bank", src: "/landing-page/company/sterling-bank.png", variant: "medium" },
  { name: "Intel", src: "/landing-page/company/intel.svg", variant: "medium" },
  { name: "Access Bank", src: "/landing-page/company/access-bank.svg", variant: "wide" },
  { name: "Roqqu", src: "/landing-page/company/roqqu.svg", variant: "wide" },
  { name: "Gopaddi", src: "/landing-page/company/goppadi.svg", variant: "wide" },
];

const VARIANT_STYLES: Record<LogoVariant, string> = {
  compact: "h-8 sm:h-10 w-auto max-w-[48px] sm:max-w-[58px]",
  medium: "h-7 sm:h-[34px] w-auto max-w-[110px] sm:max-w-[135px]",
  wide: "h-6 sm:h-[30px] w-auto max-w-[130px] sm:max-w-[160px]",
};

export function CompanyCarousel() {
  return (
    <div className="mt-14 sm:mt-18">
          <p className="text-center text-sm font-medium text-[#475467]">
            Companies where our mentors work
          </p>

          {/* Single Carousel container with subtle edge masks */}
          <div
            className="mt-8 overflow-hidden py-3"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            }}
          >
            <style>{`
              @keyframes companySingleMarquee {
                0% { transform: translate3d(-50%, 0, 0); }
                100% { transform: translate3d(0, 0, 0); }
              }
              .company-single-track {
                display: flex !important;
                width: max-content !important;
                will-change: transform;
                animation: companySingleMarquee 50s linear infinite !important;
              }
              .company-single-track:hover {
                animation-play-state: paused !important;
              }
            `}</style>

            <div className="company-single-track flex items-center gap-10 sm:gap-14 shrink-0">
              {[...COMPANIES, ...COMPANIES].map((company, idx) => (
                <div
                  key={`${company.name}-${idx}`}
                  title={company.name}
                  className="flex h-12 sm:h-14 items-center justify-center shrink-0 px-2 transition-transform duration-200 hover:scale-105"
                >
                  <Image
                    src={company.src}
                    alt={company.name}
                    width={160}
                    height={44}
                    unoptimized
                    loading="eager"
                    className={`${VARIANT_STYLES[company.variant]} object-contain brightness-0 opacity-85 transition-opacity hover:opacity-100`}
                  />
                </div>
              ))}
            </div>
          </div>
    </div>
  );
}
