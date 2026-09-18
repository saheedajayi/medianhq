"use client";

import Link from "next/link";
import Image from "next/image";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.05] bg-white/70 backdrop-blur-md backdrop-saturate-150 transition-all shadow-[0_4px_20px_-4px_rgba(16,24,40,0.03)]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
          <Image
            src="/median-logo.svg"
            alt="Median"
            width={140}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#FF5514] bg-white px-5 text-sm font-semibold !text-[#FF5514] shadow-2xs transition-all hover:bg-[#FFF5F1] active:scale-[0.98]"
          >
            Sign up
          </Link>
          <Link
            href="/signin"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#FF5514] px-6 text-sm font-semibold !text-white shadow-xs transition-all hover:bg-[#E84D12] active:scale-[0.98]"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
