"use client";

import { useWaitlistStats } from "@/services/waitlist/queries/waitlist.queries";

const formatter = new Intl.NumberFormat("en");

export function WaitlistCountBadge() {
  const { data, isLoading } = useWaitlistStats();
  const totalPeople = data?.totalPeople ?? 0;
  const countLabel = isLoading ? "..." : formatter.format(totalPeople);
  const noun = totalPeople === 1 ? "Professional" : "Professionals";

  return (
    <div
      className="mt-8 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-accent-150 bg-[#fffaf5] px-4 py-3 text-center text-xs font-semibold text-text-900 sm:gap-3 sm:px-6 sm:text-sm"
      style={{ maxWidth: "calc(100vw - 40px)" }}
      aria-live="polite"
    >
      <span className="size-2.5 rounded-full bg-primary" />
      <span className="font-bold text-primary">{countLabel}</span>
      <span>{noun} already on the waitlist</span>
    </div>
  );
}
