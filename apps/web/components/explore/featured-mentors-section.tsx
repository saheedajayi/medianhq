"use client";

import { useRef } from "react";
import { ArrowLeft2, ArrowRight2 } from "iconsax-react";
import { ExploreMentor } from "./types";
import { MentorCard } from "./mentor-card";

interface FeaturedMentorsSectionProps {
  mentors: ExploreMentor[];
  title?: string;
}

export function FeaturedMentorsSection({
  mentors,
  title = "Featured Mentors",
}: FeaturedMentorsSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 380;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (mentors.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-wider text-[#667085] uppercase">
          {title}
        </h2>

        {/* Carousel Navigation Buttons */}
        <div className="hidden items-center gap-1.5 sm:flex">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Previous featured mentors"
            className="flex size-8 items-center justify-center rounded-full border border-[#EAECF0] bg-white text-[#344054] shadow-2xs transition-colors hover:bg-[#F9FAFB] hover:text-[#101828]"
          >
            <ArrowLeft2 size="16" variant="Linear" color="#344054" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Next featured mentors"
            className="flex size-8 items-center justify-center rounded-full border border-[#EAECF0] bg-white text-[#344054] shadow-2xs transition-colors hover:bg-[#F9FAFB] hover:text-[#101828]"
          >
            <ArrowRight2 size="16" variant="Linear" color="#344054" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Row */}
      <div
        ref={scrollContainerRef}
        className="flex gap-5 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x snap-mandatory"
      >
        {mentors.map((mentor) => (
          <div
            key={mentor.id}
            className="w-[320px] shrink-0 snap-start sm:w-[360px] lg:w-[380px]"
          >
            <MentorCard mentor={mentor} showFeaturedBadge={true} />
          </div>
        ))}
      </div>
    </section>
  );
}
