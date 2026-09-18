"use client";

import Link from "next/link";
import Image from "next/image";

const COMPANIES = [
  { name: "Remita", src: "/landing-page/company/remita.png" },
  { name: "Flutterwave", src: "/landing-page/company/flutterwave.png" },
  { name: "Lotus Bank", src: "/landing-page/company/lotus-bank.png" },
  { name: "Open Access Data Center", src: "/landing-page/company/open-access-data-center.png" },
  { name: "VFD Microfinance Bank", src: "/landing-page/company/vfd-bank.png" },
  { name: "Risevest", src: "/landing-page/company/risevest.png" },
  { name: "PwC", src: "/landing-page/company/pwc.png" },
  { name: "Moniepoint", src: "/landing-page/company/moniepoint.png" },
  { name: "EY", src: "/landing-page/company/ey.svg" },
  { name: "Paystack", src: "/landing-page/company/paystack.png" },
  { name: "Microsoft", src: "/landing-page/company/microsoft.svg" },
  { name: "Google", src: "/landing-page/company/google.svg" },
  { name: "Andela", src: "/landing-page/company/andela.svg" },
  { name: "KPMG", src: "/landing-page/company/kpmg.svg" },
  { name: "Deloitte", src: "/landing-page/company/deloitte.svg" },
  { name: "Goldman Sachs", src: "/landing-page/company/goldmansachs.svg" },
  { name: "Barclays", src: "/landing-page/company/barclays.svg" },
  { name: "Rolls Royce", src: "/landing-page/company/rollsroyce.svg" },
  { name: "Apple", src: "/landing-page/company/apple.svg" },
  { name: "Netflix", src: "/landing-page/company/netflix.svg" },
  { name: "Cowrywise", src: "/landing-page/company/cowrywise.svg" },
  { name: "Interswitch", src: "/landing-page/company/interswitch.svg" },
  { name: "Visa", src: "/landing-page/company/visa.svg" },
  { name: "Mastercard", src: "/landing-page/company/mastercard.svg" },
  { name: "IHS", src: "/landing-page/company/ihs.svg" },
  { name: "Ilorin Innovation Hub", src: "/landing-page/company/ilorin-innovation-hub.svg" },
  { name: "LSETF", src: "/landing-page/company/lsetf.png" },
  { name: "Lagos Business School", src: "/landing-page/company/lagos-business-school.png" },
  { name: "TechCabal", src: "/landing-page/company/techcabal.png" },
  { name: "ALX", src: "/landing-page/company/alx.svg" },
  { name: "Autogon AI", src: "/landing-page/company/autogon-ai.png" },
  { name: "Zoho", src: "/landing-page/company/zoho.svg" },
  { name: "FirstBank", src: "/landing-page/company/firstbank.svg" },
  { name: "Sterling Bank", src: "/landing-page/company/sterling-bank.png" },
  { name: "Intel", src: "/landing-page/company/intel.svg" },
  { name: "Access Bank", src: "/landing-page/company/access-bank.svg" },
  { name: "Roqqu", src: "/landing-page/company/roqqu.svg" },
  { name: "Gopaddi", src: "/landing-page/company/goppadi.svg" },
];

export function LandingHero() {
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
          <h1 className="text-4xl font-normal tracking-tight text-[#101828] sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="font-playfair font-bold">Meet the mentor</span>{" "}
            <span className="font-sans font-normal text-[#101828]">who</span>
            <br />
            <span
              className="font-playfair italic font-medium"
              style={{ color: "#FF5514" }}
            >
              changes everything.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-[#475467] sm:text-lg">
            Vetted experts. Real advice. Free to start. The mentorship platform
            built for ambitious African professionals.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/signup"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#FF5514] px-8 text-sm font-semibold !text-white shadow-sm transition-all hover:bg-[#e84d12] sm:w-auto"
            >
              Find a mentor
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#FF5514] bg-white px-8 text-sm font-semibold !text-[#FF5514] shadow-2xs transition-all hover:bg-[#FFF5F1] active:scale-[0.98] sm:w-auto"
            >
              Become a mentor
            </Link>
          </div>
        </div>

        {/* Social Proof - Single Carousel as per Figma design */}
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
                  className="flex h-10 items-center justify-center shrink-0 px-2 transition-transform duration-200 hover:scale-105"
                >
                  <Image
                    src={company.src}
                    alt={company.name}
                    width={140}
                    height={36}
                    unoptimized
                    loading="eager"
                    className="h-7 sm:h-8 w-auto max-w-[130px] object-contain brightness-0 opacity-85 transition-opacity hover:opacity-100"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
