"use client";

import Link from "next/link";
import Image from "next/image";

export function LandingFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#FFFAF5] pt-20 pb-10">
      {/* Ambient Warm Sunset Gradient Glow behind the giant logo matching Figma */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none"
        style={{
          background:
            "radial-gradient(ellipse 85% 65% at 85% 95%, #FFCEB7 0%, #FFE2D4 32%, #FFF0E7 58%, transparent 85%), linear-gradient(180deg, #FFFAF5 0%, #FFFAF5 45%, #FFF5EF 75%, #FFEADB 100%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Columns */}
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-4">
          {/* Company Column */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-[#101828] uppercase">
              Company
            </h4>
            <ul className="mt-5 space-y-3.5 text-sm text-[#475467]">
              <li>
                <Link href="#" className="transition-colors hover:text-[#101828]">
                  About us
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-[#101828]">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-[#101828]">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-[#101828]">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-[#101828]">
                  Partner with us
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-[#101828]">
                  Help center
                </Link>
              </li>
            </ul>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-[#101828] uppercase">
              Product
            </h4>
            <ul className="mt-5 space-y-3.5 text-sm text-[#475467]">
              <li>
                <Link href="/signup?role=mentee" className="transition-colors hover:text-[#101828]">
                  Find a mentor
                </Link>
              </li>
              <li>
                <Link href="/signup?role=mentor" className="transition-colors hover:text-[#101828]">
                  Become a mentor
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-[#101828]">
                  Session payment
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us Column */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-xs font-bold tracking-wider text-[#101828] uppercase">
              Follow Us
            </h4>
            <div className="mt-5 flex items-center gap-3">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/median-hq/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex size-10 items-center justify-center rounded-xl bg-[#FFEEE8] text-[#475467] transition-all hover:bg-[#FFD9A8] hover:text-[#101828]"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="https://x.com/Median_HQ"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="flex size-10 items-center justify-center rounded-xl bg-[#FFEEE8] text-[#475467] transition-all hover:bg-[#FFD9A8] hover:text-[#101828]"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/median_hq"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex size-10 items-center justify-center rounded-xl bg-[#FFEEE8] text-[#475467] transition-all hover:bg-[#FFD9A8] hover:text-[#101828]"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Giant Watermark Graphic */}
        <div className="mt-16 w-full overflow-hidden select-none sm:mt-24">
          <Image
            src="/landing-page/median-wordmark-orange.svg"
            alt="median"
            width={1313}
            height={356}
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Bottom Bar: Links & Copyright */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 pt-4 text-xs text-[#667085] sm:mt-12 sm:flex-row">
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-[#101828]">
              Privacy
            </Link>
            <Link href="#" className="hover:text-[#101828]">
              Terms
            </Link>
            <a href="mailto:hello@median.com" className="hover:text-[#101828]">
              hello@median.com
            </a>
          </div>
          <p>© 2026 Median · All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}
