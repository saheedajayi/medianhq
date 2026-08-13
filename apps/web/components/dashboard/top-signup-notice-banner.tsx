"use client";

import { Clock } from "iconsax-react";
import { useCurrentUser } from "@/hooks/use-current-user";

function formatSignupAge(createdAt?: string | Date): string {
  if (!createdAt) return "24 hours";
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - created.getTime());
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"}`;
  }
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"}`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? "day" : "days"}`;
  }
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} ${diffMonths === 1 ? "month" : "months"}`;
}

export function TopSignupNoticeBanner() {
  const { data: user } = useCurrentUser();
  const signupAge = formatSignupAge(user?.createdAt);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#EAECF0] bg-white px-5 py-3.5 shadow-2xs">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FFF0EB] text-[#FF5500]">
        <Clock size="18" variant="Linear" color="#FF5500" />
      </div>

      <p className="text-sm text-[#475467]">
        <strong className="font-semibold text-[#101828]">
          You signed up {signupAge} ago.
        </strong>{" "}
        <span>Book your first session to start your journey</span>
      </p>
    </div>
  );
}
