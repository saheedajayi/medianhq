import Link from "next/link";
import { Profile } from "iconsax-react";

interface MenteeUnavailableStateProps {
  /** True when the mentee exists but has not booked this mentor */
  isForbidden?: boolean;
}

export function MenteeUnavailableState({ isForbidden = false }: MenteeUnavailableStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-[20px] border border-[#EAECF0] bg-white px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-[#FFF4ED]">
        <Profile size="28" variant="Bulk" color="#FF5500" />
      </div>

      <h3 className="mt-4 text-lg font-bold text-[#101828]">
        {isForbidden ? "You can't view this profile" : "Mentee not found"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-[#667085]">
        {isForbidden
          ? "You can only view mentees who have booked a session with you."
          : "This mentee profile doesn't exist or is no longer available."}
      </p>
      <Link
        href="/mentor/bookings"
        className="mt-4 rounded-full bg-[#FF5500] px-5 py-2 text-xs font-semibold !text-white transition-colors hover:bg-[#E04B00]"
      >
        Back to Bookings
      </Link>
    </div>
  );
}
