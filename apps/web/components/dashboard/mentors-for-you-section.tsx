"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Global } from "iconsax-react";
import { MentorCard } from "@/components/explore/mentor-card";
import type { ExploreMentor } from "@/components/explore/types";
import { isMockDataEnabled, mockExploreMentors } from "@/mocks";
import { mentorsService } from "@/services/mentors";

const USE_MOCKS = isMockDataEnabled("dashboard");

const fallbackMentors: ExploreMentor[] = USE_MOCKS ? mockExploreMentors.slice(0, 6) : [];

interface MentorsForYouSectionProps {
  mentors?: ExploreMentor[];
}

export function MentorsForYouSection({ mentors }: MentorsForYouSectionProps) {
  const [list, setList] = useState<ExploreMentor[]>(mentors || fallbackMentors);
  const [isLoading, setIsLoading] = useState(!mentors && fallbackMentors.length === 0);

  useEffect(() => {
    if (mentors && mentors.length > 0) {
      setList(mentors);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    mentorsService
      .getFeatured(6)
      .then((featured: any) => {
        if (!isMounted || !Array.isArray(featured) || featured.length === 0) return;
        setList(featured as ExploreMentor[]);
      })
      .catch((err) => {
        console.warn("Could not fetch featured mentors from API:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [mentors]);

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-[#EAECF0] bg-white p-6 md:p-8">
      <h2 className="text-xs font-bold tracking-wider text-[#667085] uppercase">
        Mentors For You
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[400px] animate-pulse rounded-[20px] border border-[#F2F2F7] bg-[#F7F8FB]"
            />
          ))}
        </div>
      ) : list.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((mentor, index) => (
            <MentorCard
              key={`${mentor.id}-${index}`}
              mentor={mentor}
              showFeaturedBadge={false}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-[#FFF4ED]">
            <Global size="28" variant="Bulk" color="#FF5500" />
          </div>

          <h3 className="mt-4 text-lg font-bold text-[#101828]">
            No mentor recommendations yet
          </h3>
          <p className="mt-1 max-w-sm text-sm text-[#667085]">
            We&apos;ll suggest mentors for you here. In the meantime, explore our mentors to find the right fit.
          </p>
          <Link
            href="/mentee/explore"
            className="mt-4 rounded-full bg-[#FF5500] px-5 py-2 text-xs font-semibold !text-white transition-colors hover:bg-[#E04B00]"
          >
            Explore Mentors
          </Link>
        </div>
      )}
    </section>
  );
}
