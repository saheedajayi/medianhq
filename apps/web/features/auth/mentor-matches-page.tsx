"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/base/button";
import { ArrowRight, UserSearch } from "lucide-react";
import { mentorsService } from "@/services/mentors";

export function MentorMatchesPage() {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ["mentorMatches"],
    queryFn: () => mentorsService.getMatches(),
  });

  const mentors = data?.data || [];

  if (!isLoading && mentors.length === 0 && !error) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-8 flex size-16 items-center justify-center rounded-full border border-[#e2e8f0] bg-white">
          <div className="flex size-8 items-center justify-center rounded-full border-[2px] border-[#111827]">
            <UserSearch className="size-4 text-[#111827]" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="mb-4 text-[28px] font-bold tracking-[-0.02em] text-[#4b100d]">
          We&apos;re finding your perfect matches!
        </h1>

        <p className="mb-10 max-w-[440px] text-[15px] text-[#64748b] leading-relaxed">
          We are carefully reviewing our network of top-tier mentors to find the best fit for your specific goals. Keep an eye on your inbox—we&apos;ll email you as soon as your matches are ready.
        </p>

        <Button
          onClick={() => router.replace("/dashboard")}
          className="h-14 w-full rounded-full bg-primary text-base font-medium text-white shadow-none hover:bg-primary/90 sm:w-[320px]"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <>
      <header className="mb-8 text-center">
        <h1 className="text-[28px] font-bold tracking-[-0.02em] text-[#4b100d]">
          Top mentor matches for you
        </h1>
        <p className="mt-2 text-lg text-[#344054]">Based on your goals</p>
      </header>

      <div className="grid gap-4">
        {isLoading && (
          <div className="text-center text-[#64748b] py-8">Finding your best matches...</div>
        )}
        {error && (
          <div className="text-center text-red-500 py-8">Failed to load mentors</div>
        )}
        {mentors.map((mentor) => (
          <div
            key={mentor.id}
            className="flex items-center justify-between rounded-2xl border border-[#eaecf0] p-4 sm:p-5 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <img
                src={mentor.image}
                alt={mentor.name}
                className="size-12 rounded-full object-cover sm:size-14"
              />
              <div>
                <h3 className="font-semibold text-[#101828] text-base sm:text-lg">
                  {mentor.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#475467]">{mentor.role}</p>
                <p className="mt-0.5 text-xs text-[#667085]">
                  {mentor.sessions}
                </p>
              </div>
            </div>

            <div className="flex h-8 items-center justify-center rounded-full bg-[#e6f4ea] px-3">
              <span className="text-[13px] font-medium text-[#14532d]">
                {mentor.match} Match
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Button
          onClick={() => router.replace("/dashboard")}
          className="h-14 w-full rounded-full text-base font-medium shadow-none"
        >
          Go to Dashboard
          <ArrowRight className="ml-2 size-5" />
        </Button>
      </div>
    </>
  );
}
