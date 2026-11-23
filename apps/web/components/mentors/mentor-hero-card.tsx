"use client";

import Image from "next/image";
import Link from "next/link";
import { Location, Messages, Global, Instagram } from "iconsax-react";
import { Link2, Star } from "lucide-react";
import { MentorDetailProfile, MentorLink } from "./types";

/** The icon for one of the mentor's links; a custom link to Instagram gets Instagram's */
function LinkIcon({ link }: { link: MentorLink }) {
  if (link.kind === "website") return <Global size="18" variant="Outline" color="#475467" />;
  if (link.kind === "linkedin") {
    return (
      <svg className="size-4.5 fill-current" viewBox="0 0 24 24" aria-hidden>
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6Z" />
      </svg>
    );
  }
  if (link.kind === "x") {
    return (
      <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (/(^|\.)instagram\.com$/i.test(hostOf(link.url))) {
    return <Instagram size="18" variant="Outline" color="#475467" />;
  }
  return <Link2 className="size-4.5" />;
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

interface MentorHeroCardProps {
  mentor: MentorDetailProfile;
}

export function MentorHeroCard({ mentor }: MentorHeroCardProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[#F2F2F7] bg-[#FDF9F6] p-6 text-center">
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

      {/* Social Media Links */}
      {mentor.links.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
          {mentor.links.map((link) => (
            <Link
              key={`${link.kind}-${link.url}`}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              aria-label={link.title}
              title={link.title}
              className="flex size-10 items-center justify-center rounded-xl border border-[#EAECF0] bg-white text-[#475467] transition-colors hover:bg-[#F9FAFB] hover:text-[#FF5500]"
            >
              <LinkIcon link={link} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
