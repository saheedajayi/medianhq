"use client";

import Image from "next/image";
import Link from "next/link";
import { Location, Messages } from "iconsax-react";
import { Star } from "lucide-react";
import { ExploreMentor } from "./types";

interface MentorCardProps {
  mentor: ExploreMentor;
  showFeaturedBadge?: boolean;
}

export function MentorCard({ mentor, showFeaturedBadge }: MentorCardProps) {
  const isFeatured = showFeaturedBadge ?? mentor.isFeatured;

  return (
    <div className="relative flex flex-col justify-between rounded-[20px] border border-[#F2F2F7] bg-white p-6 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Top Right "Featured" Badge */}
      {isFeatured && (
        <span className="absolute top-5 right-5 inline-flex items-center rounded-full bg-[#EDE6E6] px-3 py-0.5 text-xs font-medium text-[#4B1210]">
          Featured
        </span>
      )}

      {/* Main Card Body */}
      <div className="flex flex-col items-center text-center">
        {/* Centered Avatar */}
        <div className="relative mb-3.5 size-[110px] overflow-hidden rounded-full border-2 border-white shadow-xs">
          <Image
            src={mentor.avatarUrl || "/mentor-avatar.png"}
            alt={mentor.name}
            fill
            sizes="120px"
            className="object-cover"
          />
        </div>

        {/* Name and Role @ Company */}
        <h3 className="text-base font-semibold text-[#101828]">
          {mentor.name}
        </h3>
        <p className="mt-0.5 text-sm font-normal text-[#667085]">
          {mentor.role} @ {mentor.company}
        </p>

        {/* Metadata Row: Location, Sessions, Rating */}
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs sm:text-[13px] text-[#475467]">
          <div className="flex items-center gap-1">
            <Location size="15" variant="Outline" color="#667085" className="shrink-0" />
            <span>{mentor.location}</span>
          </div>

          <div className="flex items-center gap-1">
            <Messages size="15" variant="Linear" color="#667085" className="shrink-0" />
            <span>{mentor.sessionCount} Session</span>
          </div>

          <div className="flex items-center gap-1">
            <Star className="size-3.5 fill-[#FDB022] text-[#FDB022] shrink-0" />
            <span>
              {mentor.rating} ({mentor.reviewCount} Reviews)
            </span>
          </div>
        </div>

        {/* Bio Snippet */}
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#475467]">
          {mentor.bio}
        </p>

        {/* Tags / Skills */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
          {mentor.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-[#F7F8FB] px-3 py-1 text-xs font-medium text-[#344054]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer: Availability & CTA */}
      <div className="mt-6 flex items-center justify-between border-t border-[#F2F4F7] pt-4">
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[#FF5500]">
              Next availability
            </span>
            <span className="rounded-full bg-[#FFEEE8] px-2 py-0.5 text-[11px] font-medium text-[#FF5500]">
              {mentor.nextAvailability.relative}
            </span>
          </div>
          <span className="mt-0.5 text-xs text-[#667085]">
            {mentor.nextAvailability.formattedDate}
          </span>
        </div>

        <Link
          href={`/mentors/${mentor.id}`}
          className="inline-flex items-center justify-center rounded-full bg-[#FF5500] px-4.5 py-2 text-sm font-medium !text-white shadow-2xs transition-all hover:bg-[#E04B00] active:scale-[0.98]"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
