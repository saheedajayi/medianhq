"use client";

interface MentorApplicationStatusCardProps {
  /** MentorProfile status from the current user; only shown until the mentor is approved */
  status?: string;
}

export function MentorApplicationStatusCard({ status }: MentorApplicationStatusCardProps) {
  const isRejected = status === "REJECTED";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#FFDEC9] bg-[#FFF9F6] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-[#101828] sm:text-lg">
          {isRejected
            ? "Your application to mentor wasn't approved this time."
            : "Your application to mentor is under review."}
        </h3>
        <p className="max-w-3xl text-xs font-normal text-[#475467] leading-relaxed sm:text-sm">
          {isRejected
            ? "We've emailed you our team's feedback. Reply to that email if you have any questions."
            : "Every mentor on Median is reviewed by a real person, that's what makes the community worth being part of. We'll be in touch within 7 days. We'll send you an email."}
        </p>
      </div>

      <div className="flex shrink-0 items-center sm:self-center">
        <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#F4E6E6] px-4 py-1.5 text-xs font-medium text-[#7A271A] sm:text-sm">
          {isRejected ? "Not approved" : "Pending approval"}
        </span>
      </div>
    </div>
  );
}
