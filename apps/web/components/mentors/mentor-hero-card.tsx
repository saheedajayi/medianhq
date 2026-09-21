"use client";

import Image from "next/image";
import Link from "next/link";
import { Location, Messages, Global, Instagram } from "iconsax-react";
import { Star } from "lucide-react";
import { MentorDetailProfile } from "./types";

interface MentorHeroCardProps {
  mentor: MentorDetailProfile;
}

export function MentorHeroCard({ mentor }: MentorHeroCardProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[#F2F2F7] bg-[#FDF9F6] p-6 text-center">
      {/* Mentor Avatar */}
      <div className="relative mb-3 size-[112px] overflow-hidden rounded-full border-4 border-white shadow-sm">
        <Image
          src={mentor.avatarUrl || "/mentor-avatar.png"}
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
        <div className="flex items-center gap-1">
          <Location size="16" variant="Outline" color="#667085" className="shrink-0" />
          <span>{mentor.location}</span>
        </div>

        <div className="flex items-center gap-1">
          <Messages size="16" variant="Outline" color="#667085" className="shrink-0" />
          <span>{mentor.sessionCount} Session</span>
        </div>

        <div className="flex items-center gap-1">
          <Star className="size-4 fill-[#FDB022] text-[#FDB022] shrink-0" />
          <span>
            {mentor.rating} ({mentor.reviewCount} Reviews)
          </span>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="mt-3 flex items-center gap-2.5">
        {mentor.socials.website && (
          <Link
            href={mentor.socials.website}
            target="_blank"
            rel="noreferrer"
            aria-label="Website"
            className="flex size-10 items-center justify-center rounded-xl border border-[#EAECF0] bg-white text-[#475467] shadow-2xs transition-colors hover:bg-[#F9FAFB] hover:text-[#FF5500]"
          >
            <Global size="18" variant="Outline" color="#475467" />
          </Link>
        )}

        {mentor.socials.facebook && (
          <Link
            href={mentor.socials.facebook}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="flex size-10 items-center justify-center rounded-xl border border-[#EAECF0] bg-white text-[#475467] shadow-2xs transition-colors hover:bg-[#F9FAFB] hover:text-[#FF5500]"
          >
            <svg
              className="size-4.5 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6Z" />
            </svg>
          </Link>
        )}

        {mentor.socials.instagram && (
          <Link
            href={mentor.socials.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="flex size-10 items-center justify-center rounded-xl border border-[#EAECF0] bg-white text-[#475467] shadow-2xs transition-colors hover:bg-[#F9FAFB] hover:text-[#FF5500]"
          >
            <Instagram size="18" variant="Outline" color="#475467" />
          </Link>
        )}
      </div>
    </div>
  );
}
