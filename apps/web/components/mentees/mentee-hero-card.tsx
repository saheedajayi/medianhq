import Image from "next/image";
import { Location, Messages } from "iconsax-react";
import { Star } from "lucide-react";
import { ProfileLinkTiles } from "@/components/mentors/profile-link-tiles";
import type { MenteeDetailProfile } from "./types";

interface MenteeHeroCardProps {
  mentee: MenteeDetailProfile;
}

export function MenteeHeroCard({ mentee }: MenteeHeroCardProps) {
  const headline = [mentee.role, mentee.company].filter(Boolean).join(" @ ");

  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-[#FFEEE8] bg-[#FFFAF5] p-6 text-center">
      <div className="relative mb-3 size-[112px] overflow-hidden rounded-full border-4 border-white">
        <Image
          src={mentee.avatarUrl}
          alt={mentee.name}
          fill
          sizes="120px"
          priority
          className="object-cover"
        />
      </div>

      <h1 className="text-lg font-semibold text-[#D94B09]">{mentee.name}</h1>

      {headline && <p className="mt-1 text-sm font-normal text-[#475467]">{headline}</p>}

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-[#475467] sm:text-sm">
        {mentee.location && (
          <div className="flex items-center gap-1">
            <Location size="16" variant="Outline" color="#667085" className="shrink-0" />
            <span>{mentee.location}</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Messages size="16" variant="Linear" color="#667085" className="shrink-0" />
          <span>{mentee.sessionCount} Session</span>
        </div>

        {mentee.reviewCount > 0 && (
          <div className="flex items-center gap-1">
            <Star className="size-4 shrink-0 fill-[#FDB022] text-[#FDB022]" />
            <span>
              {mentee.rating} ({mentee.reviewCount} Reviews)
            </span>
          </div>
        )}
      </div>

      {mentee.links.length > 0 && (
        <div className="mt-4">
          <ProfileLinkTiles links={mentee.links} />
        </div>
      )}
    </div>
  );
}
