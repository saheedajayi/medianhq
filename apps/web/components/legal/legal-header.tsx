import Link from "next/link";
import Image from "next/image";

export function LegalHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#F2F4F7] bg-[#FCFCFD]">
      <div className="mx-auto flex h-[84px] max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-16">
        <Link
          href="/"
          aria-label="Median home"
          className="flex shrink-0 items-center transition-opacity hover:opacity-90"
        >
          <Image
            src="/median-logo.svg"
            alt="Median"
            width={140}
            height={32}
            className="h-7 w-auto"
            priority
          />
        </Link>

        {/* <Link
          href="/waitlist"
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#FF5514] px-6 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#E84D12] active:scale-[0.98]"
        >
          Join waitlist
        </Link> */}
      </div>
    </header>
  );
}
