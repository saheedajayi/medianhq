"use client";

import Image from "next/image";
import { Location, Messages } from "iconsax-react";
import { Star } from "lucide-react";
import { ProfileLinkTiles } from "./profile-link-tiles";
import { MentorDetailProfile } from "./types";

interface MentorHeroCardProps {
  mentor: MentorDetailProfile;
}

export function MentorHeroCard({ mentor }: MentorHeroCardProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-[#FFEEE8] bg-[#FFFAF5] p-6 text-center">
      {/* Mentor Avatar */}
      <div className="relative mb-3 size-[112px] overflow-hidden rounded-full border-4 border-white">
        <Image
          src={mentor.avatarUrl || "/default-avatar.svg"}
          alt={mentor.name}
          fill
          sizes="120px"
          priority
          className="object-cover"
        />
      </div>

      {/* Mentor Name in Primary Brand Orange */}
      <h1 className="text-lg font-semibold text-[#D94B09]">
        {mentor.name}
      </h1>

      {/* Role & Company */}
      <p className="mt-1 text-sm font-normal text-[#475467]">
        {mentor.role} @ {mentor.company}
      </p>

      {/* Metadata: Location, Sessions, Rating */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-[#475467] sm:text-sm">
        {mentor.location && (
          <div className="flex items-center gap-1">
            <Location size="16" variant="Outline" color="#667085" className="shrink-0" />
            <span>{mentor.location}</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Messages size="16" variant="Linear" color="#667085" className="shrink-0" />
          <span>{mentor.sessionCount} Session</span>
        </div>

        <div className="flex items-center gap-1">
          <Star className="size-4 fill-[#FDB022] text-[#FDB022] shrink-0" />
          <span>
            {mentor.reviewCount > 0
              ? `${mentor.rating} (${mentor.reviewCount} Reviews)`
              : "New mentor"}
          </span>
        </div>
      </div>

      {/* Saved links, then the tile that shares this profile */}
      <div className="mt-4">
        <ProfileLinkTiles
          links={mentor.links}
          sharePath={`/mentors/${mentor.id}`}
          shareTitle={`${mentor.name} on Median`}
        />
      </div>
    </div>
  );
}
