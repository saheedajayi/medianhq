"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/base/button";
import { ArrowRight, UserSearch } from "lucide-react";
import Link from "next/link";
import { mentorsService } from "@/services/mentors";

export function MentorMatchesPage() {
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
          We're finding your perfect matches!
        </h1>

        <p className="mb-10 max-w-[440px] text-[15px] text-[#64748b] leading-relaxed">
          We are carefully reviewing our network of top-tier mentors to find the best fit for your specific goals. Keep an eye on your inbox—we'll email you as soon as your matches are ready.
        </p>

        <Button
          asChild
          className="h-14 w-full rounded-full bg-primary text-base font-medium text-white shadow-none hover:bg-primary/90 sm:w-[320px]"
        >
          <Link href="/dashboard">Go to Dashboard</Link>
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
            className="flex items-center justify-between rounded-2xl border border-[#f1f5f9] bg-white p-4 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={mentor.image}
                  alt={mentor.name}
                  className="size-14 rounded-full object-cover"
                />
                <svg
                  className="absolute -bottom-1.5 -right-1.5 size-7 drop-shadow-sm"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
                    className="fill-primary"
                  />
                  <path
                    d="m9 12 2 2 4-4"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#111827]">
                  {mentor.name}
                </h3>
                <p className="mt-0.5 text-[15px] text-[#64748b]">
                  {mentor.role}
                </p>
                <p className="mt-1 text-[15px] text-[#64748b]">
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
        <Button asChild className="h-14 w-full rounded-full text-base font-medium shadow-none">
          <Link href="/dashboard">
            Go to Dashboard
            <ArrowRight className="ml-2 size-5" />
          </Link>
        </Button>
      </div>
    </>
  );
}
