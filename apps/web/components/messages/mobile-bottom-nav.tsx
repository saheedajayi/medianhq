import Link from "next/link";
import {
  Element3,
  Global,
  Calendar as CalendarIconSax,
  Messages2,
} from "iconsax-react";

export function MobileBottomNav() {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-sm rounded-full border border-[#EAECF0] bg-white/95 px-4 py-2 shadow-lg backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-around">
        <Link
          href="/dashboard"
          className="flex flex-col items-center gap-1 text-[#667085] hover:text-[#101828]"
        >
          <Element3 size="20" variant="Outline" color="#667085" />
          <span className="text-[10px] font-medium">Dashboard</span>
        </Link>
        <Link
          href="/mentee/explore"
          className="flex flex-col items-center gap-1 text-[#667085] hover:text-[#101828]"
        >
          <Global size="20" variant="Outline" color="#667085" />
          <span className="text-[10px] font-medium">Explore</span>
        </Link>
        <Link
          href="/mentee/booking-session"
          className="flex flex-col items-center gap-1 text-[#667085] hover:text-[#101828]"
        >
          <CalendarIconSax size="20" variant="Outline" color="#667085" />
          <span className="text-[10px] font-medium">Bookings</span>
        </Link>
        <div className="flex flex-col items-center gap-1 rounded-full bg-[#FFF0EB] px-3 py-1 text-[#FF5514]">
          <Messages2 size="20" variant="Bold" color="#FF5514" />
          <span className="text-[10px] font-semibold text-[#FF5514]">Messages</span>
        </div>
      </div>
    </div>
  );
}
