"use client";

import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/", label: "Product" },
  { href: "/pricing", label: "Pricing" },
  // There is no blog yet
  { href: "#", label: "Blogs" },
  { href: "/contact", label: "Contact us" },
];

interface LandingHeaderProps {
  /** Shows the page links between the logo and the buttons */
  showNav?: boolean;
}

export function LandingHeader({ showNav = false }: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.05] bg-white/70 backdrop-blur-md backdrop-saturate-150 transition-all">
      <div className="mx-auto flex h-14 sm:h-20 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center transition-opacity hover:opacity-90">
          <Image
            src="/median-logo.svg"
            alt="Median"
            width={140}
            height={32}
            className="h-6 sm:h-8 w-auto"
            priority
          />
        </Link>

        {showNav && (
          <nav aria-label="Main" className="hidden items-center gap-5 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium !text-[#475467] transition-colors hover:!text-[#101828]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Action Buttons */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Link
            href="/signup"
            className="inline-flex h-8 sm:h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[#FF5514] bg-white px-3 sm:px-5 text-xs sm:text-sm font-semibold !text-[#FF5514] transition-all hover:bg-[#FFF5F1] active:scale-[0.98]"
          >
            Sign up
          </Link>
          <Link
            href="/signin"
            className="inline-flex h-8 sm:h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#FF5514] px-3.5 sm:px-6 text-xs sm:text-sm font-semibold !text-white transition-all hover:bg-[#E84D12] active:scale-[0.98]"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
