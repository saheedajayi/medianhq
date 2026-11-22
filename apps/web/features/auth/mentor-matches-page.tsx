"use client";

import { useState } from "react";
import { Button } from "@/components/ui/base/button";
import { ArrowRight, UserSearch } from "lucide-react";
import Link from "next/link";
import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";
import { useMentorMatches } from "@/services/mentors/queries/mentors.queries";

export function MentorMatchesPage() {
  const { data, isLoading, error } = useMentorMatches();

  const mentors = data || [];
  // The best match starts selected, so Book mentor always has somewhere to go
  const [pickedId, setPickedId] = useState<string | null>(null);
  const selectedId = pickedId ?? (mentors[0] ? String(mentors[0].id) : null);

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
          className="h-14 w-full rounded-full bg-primary text-base font-medium !text-white shadow-none hover:bg-primary/90 sm:w-[320px]"
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
        <p className="mx-auto mt-2 max-w-[360px] text-base text-[#101828]">
          These recommendations are based on your goals. Choose a mentor to book your first
          session with.
        </p>
      </header>

      <div role="radiogroup" aria-label="Your mentor matches" className="grid gap-4">
        {isLoading && (
          <SkeletonGroup label="Finding your best matches" className="grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-2xl border border-[#f1f5f9] bg-white p-4"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="size-14 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-44" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-9 w-24 rounded-full" />
              </div>
            ))}
          </SkeletonGroup>
        )}
        {error && (
          <div className="text-center text-red-500 py-8">Failed to load mentors</div>
        )}
        {mentors.map((mentor) => {
          const isSelected = String(mentor.id) === selectedId;
          return (
          <button
            key={mentor.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setPickedId(String(mentor.id))}
            className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]/30 ${
              isSelected
                ? "border-[#FFB89C] bg-[#FFF6F2]"
                : "border-[#f1f5f9] bg-white hover:border-[#FFD9C9]"
            }`}
          >
            <span className="flex items-center gap-4">
              <span className="relative">
                <img
                  src={mentor.image}
                  alt={mentor.name}
                  className="size-14 rounded-full object-cover"
                />
                <svg
                  className="absolute -bottom-1.5 -right-1.5 size-7"
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
              </span>
              <span>
                <span className="block text-base font-semibold text-[#111827]">
                  {mentor.name}
                </span>
                <span className="mt-0.5 block text-[15px] text-[#64748b]">
                  {mentor.role}
                </span>
                <span className="mt-1 block text-[15px] text-[#64748b]">
                  {mentor.sessions}
                </span>
              </span>
            </span>

            <span className="flex h-8 shrink-0 items-center justify-center rounded-full bg-[#e6f4ea] px-3">
              <span className="text-[13px] font-medium text-[#14532d]">
                {mentor.match} Match
              </span>
            </span>
          </button>
          );
        })}
      </div>

      <div className="mt-8">
        <Button asChild className="h-14 w-full rounded-full text-base font-medium shadow-none">
          <Link href={selectedId ? `/mentors/${selectedId}` : "/explore"}>
            Book mentor
            <ArrowRight className="ml-2 size-5" />
          </Link>
        </Button>
      </div>
    </>
  );
}
