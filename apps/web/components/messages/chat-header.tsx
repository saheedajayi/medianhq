"use client";

import Image from "next/image";
import { Calendar } from "lucide-react";
import type { ConversationParticipant } from "@/services/messages";

export interface ChatHeaderProps {
  participant: ConversationParticipant | null;
  sessionBadge?: string;
}

export function ChatHeader({ participant, sessionBadge }: ChatHeaderProps) {
  const isOnline = participant?.isOnline ?? true;

  return (
    <>
      {/* ── Chat Header (Figma: Mentor avatar, name, Online, Career Positioning badge) ── */}
      <div className="shrink-0 flex items-center justify-between border-b border-[#F0F2F5] px-5 sm:px-6 py-3.5 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="relative size-11 sm:size-12 shrink-0 rounded-full">
            <Image
              src={participant?.avatar || "/mentors/mentor-1.png"}
              alt={participant?.name || "Mentor"}
              fill
              className="rounded-full object-cover"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 size-3 rounded-full bg-[#12B76A] ring-2 ring-white" />
            )}
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-[#101828]">
              {participant?.name}
            </h2>
            <span className="text-xs font-medium text-[#12B76A]">Online</span>
          </div>
        </div>

        {/* Career Positioning Pill Badge */}
        {sessionBadge && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#F3ECE6] bg-[#FBF4EE] px-3.5 py-1.5 text-xs font-medium text-[#7A3E26]">
            <Calendar size={13} className="shrink-0 text-[#7A3E26]" />
            <span>{sessionBadge}</span>
          </div>
        )}
      </div>

      {/* Mobile session pill if available */}
      {sessionBadge && (
        <div className="sm:hidden px-4 py-2 border-b border-[#F0F2F5] bg-[#FBF4EE]/50 flex items-center gap-1.5 text-[11px] font-medium text-[#7A3E26]">
          <Calendar size={12} className="shrink-0 text-[#7A3E26]" />
          <span className="truncate">{sessionBadge}</span>
        </div>
      )}
    </>
  );
}
