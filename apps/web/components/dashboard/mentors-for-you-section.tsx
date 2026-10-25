"use client";

import Link from "next/link";
import { Global } from "iconsax-react";
import { MentorCard } from "@/components/explore/mentor-card";
import type { ExploreMentor } from "@/components/explore/types";
import { useFeaturedMentors } from "@/services/mentors/queries/mentors.queries";
import { MentorCardGridSkeleton } from "@/components/explore/mentor-card-skeleton";

interface MentorsForYouSectionProps {
  mentors?: ExploreMentor[];
}

export function MentorsForYouSection({ mentors }: MentorsForYouSectionProps) {
  const hasProvidedMentors = !!mentors && mentors.length > 0;
  const { data: featured, isLoading: isFeaturedLoading } = useFeaturedMentors(6, {
    enabled: !hasProvidedMentors,
  });

  const list: ExploreMentor[] = hasProvidedMentors
    ? mentors
    : Array.isArray(featured) && featured.length > 0
      ? (featured as ExploreMentor[])
      : [];
  const isLoading = !hasProvidedMentors && isFeaturedLoading;

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-[#EAECF0] bg-white p-6 md:p-8">
      <h2 className="text-xs font-bold tracking-wider text-[#667085] uppercase">
        Mentors For You
      </h2>

      {isLoading ? (
        <MentorCardGridSkeleton count={3} />
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
