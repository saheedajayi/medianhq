"use client";

export function MentorApplicationStatusCard() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#FFDEC9] bg-[#FFF9F6] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 shadow-2xs">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-[#101828] sm:text-lg">
          Your application to mentor is under review.
        </h3>
        <p className="max-w-3xl text-xs font-normal text-[#475467] leading-relaxed sm:text-sm">
          Every mentor on Median is reviewed by a real person, that&apos;s what makes the community worth being part of. We&apos;ll be in touch within 7 days. We&apos;ll send you an email.
        </p>
      </div>

      <div className="flex shrink-0 items-center sm:self-center">
        <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#F4E6E6] px-4 py-1.5 text-xs font-medium text-[#7A271A] sm:text-sm">
          Pending approval
        </span>
      </div>
    </div>
  );
}
