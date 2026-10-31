"use client";

import * as React from "react";
import { useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { ChevronRight, Share2, Check } from "lucide-react";
import { Edit2 } from "iconsax-react";
import { Skeleton } from "@/components/ui/base/skeleton";
import { formatAmount } from "@/lib/currency";
import type { MentorSessionDto } from "@/services/mentor-sessions";
import { useMentorSessionStats } from "@/services/mentor-sessions/queries/mentor-sessions.queries";

interface MentorSessionDetailsProps {
  session: MentorSessionDto;
  onBack: () => void;
  onEdit: (session: MentorSessionDto) => void;
  onDelete: (session: MentorSessionDto) => void;
}

const formatCreatedAt = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (isToday(date)) return `Today, ${format(date, "h:mm a")}`;
  if (isYesterday(date)) return `Yesterday, ${format(date, "h:mm a")}`;
  return format(date, "d MMM yyyy, h:mm a");
};

function StatCard({
  label,
  value,
  note,
  isLoading,
}: {
  label: string;
  value?: string | number;
  note?: string;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-xl bg-white p-4">
      <div className="flex items-center justify-between text-xs font-medium text-[#667085]">
        <span>{label}</span>
        {note && <span className="text-[#98A2B3]">{note}</span>}
      </div>
      {isLoading ? (
        <Skeleton className="mt-3 h-8 w-20 sm:h-9" />
      ) : (
        <p className="mt-3 text-2xl font-bold tracking-tight text-[#3E0A00] sm:text-3xl">{value}</p>
      )}
    </div>
  );
}

export function MentorSessionDetails({
  session,
  onBack,
  onEdit,
  onDelete,
}: MentorSessionDetailsProps) {
  const [copied, setCopied] = useState(false);
  const stats = useMentorSessionStats(session.id);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/sessions/${session.id}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedPrice = formatAmount(session.price, session.currency);

  const sessionTypeLabel = session.type === "GROUP" ? "Group" : "1 on 1";

  const createdFormatted = formatCreatedAt(session.createdAt);
  // formatAmount reads 0 as "Free", but here it means nothing earned yet
  const earnings = stats.data
    ? stats.data.earnings > 0
      ? formatAmount(stats.data.earnings, stats.data.currency)
      : "₦0"
    : undefined;
  const paidSessions = stats.data?.paidSessions ?? 0;

  return (
    <div className="w-full flex-1 flex flex-col justify-between min-h-full">
      <div className="w-full">
        {/* Breadcrumb navigation */}
        <nav className="flex items-center gap-2 text-xs font-medium text-[#667085]">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-[#101828] transition cursor-pointer"
          >
            Sessions
          </button>
          <ChevronRight className="size-3.5 text-[#98A2B3]" />
          <span className="text-[#FF5514] font-semibold">{session.title}</span>
        </nav>

        {/* Header Row */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#101828]">
              {session.title}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                session.isLive
                  ? "border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]"
                  : "border-[#EAECF0] bg-[#F2F4F7] text-[#475467]"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${session.isLive ? "bg-[#12B76A]" : "bg-[#98A2B3]"}`}
              />
              {session.isLive ? "Live" : "Not live"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-full border border-[#D0D5DD] bg-white px-4 py-2 text-xs font-semibold text-[#344054] transition hover:bg-[#F9FAFB] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-[#12B76A]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="size-3.5 text-[#667085]" />
                  <span>Share</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onEdit(session)}
              className="inline-flex items-center gap-2 rounded-full border border-[#D0D5DD] bg-white px-4 py-2 text-xs font-semibold text-[#344054] transition hover:bg-[#F9FAFB] cursor-pointer"
            >
              <Edit2 size="16" variant="Linear" color="#344054" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        {/* Session Overview Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-[#101828]">Session Overview</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#667085]">
            {session.description || "No description provided."}
          </p>

          {/* Metadata info bar - takes full width, h-[52px], rounded-xl, bg-[#F7F8FB] */}
          <div className="mt-5 w-full h-[52px] rounded-xl bg-[#F7F8FB] px-5 sm:px-6 flex items-center gap-6 sm:gap-10 text-xs font-medium text-[#475467]">
            <div>
              Duration: <span className="font-semibold text-[#101828]">{session.durationMinutes}mins</span>
            </div>
            <div>
              Price: <span className="font-semibold text-[#101828]">{formattedPrice}</span>
            </div>
            <div>
              Type: <span className="font-semibold text-[#101828]">{sessionTypeLabel}</span>
            </div>
          </div>
        </div>

        {/* Session Stats Section */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-[#101828] mb-4">Session Stats</h2>

          {/* Banner with geometric pattern background matching Figma */}
          <div
            className="relative overflow-hidden rounded-2xl p-3 sm:p-4 bg-cover bg-center"
            style={{
              backgroundImage: "url('/sessions/session-stats-pattern.png')",
              backgroundColor: "#4D0D00",
            }}
          >
            {stats.isError && !stats.data ? (
              <div role="alert" className="relative flex items-center justify-between gap-4 rounded-xl bg-white p-4">
                <p className="text-sm text-[#475467]">We couldn&apos;t load these stats.</p>
                <button
                  type="button"
                  disabled={stats.isFetching}
                  onClick={() => stats.refetch()}
                  className="shrink-0 rounded-full border border-[#FF8D62] px-3.5 py-1.5 text-xs font-semibold text-[#FF5514] transition hover:bg-[#FDF9F6] disabled:opacity-60"
                >
                  {stats.isFetching ? "Trying again..." : "Try again"}
                </button>
              </div>
            ) : (
              <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                  label="Total Earnings"
                  value={earnings}
                  note={stats.data ? `${paidSessions} ${paidSessions === 1 ? "Session" : "Sessions"}` : undefined}
                  isLoading={stats.isLoading}
                />
                <StatCard label="Total Bookings" value={stats.data?.totalBookings} isLoading={stats.isLoading} />
                <StatCard label="Completed" value={stats.data?.completed} isLoading={stats.isLoading} />
                <StatCard label="Pending" value={stats.data?.pending} isLoading={stats.isLoading} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Meta & Actions (pinned to bottom of page) */}
      <div className="mt-auto pt-10 flex items-center justify-between text-xs text-[#667085]">
        <span>{createdFormatted && `Created: ${createdFormatted}`}</span>

        <button
          type="button"
          onClick={() => onDelete(session)}
          className="h-9 rounded-full border border-[#FF383C]/50 px-5 text-xs font-semibold text-[#FF383C] hover:bg-[#FFF1F3] transition cursor-pointer"
        >
          Delete session
        </button>
      </div>
    </div>
  );
}
