import Link from "next/link";
import { Global } from "iconsax-react";

export function MentorNotFoundState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-[20px] border border-[#EAECF0] bg-white px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-[#FFF4ED]">
        <Global size="28" variant="Bulk" color="#FF5500" />
      </div>

      <h3 className="mt-4 text-lg font-bold text-[#101828]">Mentor not found</h3>
      <p className="mt-1 max-w-sm text-sm text-[#667085]">
        This mentor profile doesn&apos;t exist or is no longer available.
      </p>
      <Link
        href="/explore"
        className="mt-4 rounded-full bg-[#FF5500] px-5 py-2 text-xs font-semibold !text-white shadow-2xs transition-colors hover:bg-[#E04B00]"
      >
        Explore Mentors
      </Link>
    </div>
  );
}
