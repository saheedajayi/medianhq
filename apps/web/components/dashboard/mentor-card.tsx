"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Messages } from "iconsax-react";

export interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  sessionCount: number;
  rating: number;
  reviewCount: number;
  bio: string;
  price: string;
  avatarUrl?: string;
}

interface MentorCardProps {
  mentor: Mentor;
}

export function MentorCard({ mentor }: MentorCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl bg-[#F9FAFB] p-6 text-center transition-all hover:bg-white hover:shadow-md">
      <div className="flex flex-col items-center gap-3">
        {/* Mentor Avatar */}
        <div className="relative size-20 overflow-hidden rounded-full border-2 border-white shadow-xs">
          <Image
            src={mentor.avatarUrl || "/mentor-avatar.png"}
            alt={mentor.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Name & Title */}
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-medium text-black">
            {mentor.name}
          </h3>
          <p className="text-sm font-medium text-[#667085]">
            {mentor.role} @ {mentor.company}
          </p>
        </div>

        {/* Meta info (Location, Sessions with Vuesax Linear Messages, Rating) - 14px (text-sm) */}
        <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1.5 text-sm text-[#667085]">
          <div className="flex items-center gap-1">
            <MapPin className="size-4 text-[#98A2B3]" />
            <span>{mentor.location}</span>
          </div>

          <div className="flex items-center gap-1">
            <Messages size="16" variant="Linear" color="#98A2B3" className="shrink-0" />
            <span>{mentor.sessionCount} Session</span>
          </div>

          <div className="flex items-center gap-1">
            <Star className="size-4 fill-[#FDB022] text-[#FDB022]" />
            <span>
              {mentor.rating} ({mentor.reviewCount} Reviews)
            </span>
          </div>
        </div>

        {/* Bio summary - 14px (text-sm) */}
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[#475467]">
          {mentor.bio}
        </p>
      </div>

      {/* Footer (Price 24px text-2xl + View Profile CTA with 14px text-sm) */}
      <div className="mt-5 flex items-center justify-between">
        <span className="text-2xl font-normal text-[#101828]">
          {mentor.price}
        </span>

        <Link
          href={`/mentors/${mentor.id}`}
          className="inline-flex items-center justify-center rounded-full bg-[#FF5500] px-4.5 py-2.5 text-sm font-medium text-white shadow-2xs transition-all hover:bg-[#E04B00] active:scale-[0.98]"
        >
          <span className="text-white font-medium">View Profile</span>
        </Link>
      </div>
    </div>
  );
}
