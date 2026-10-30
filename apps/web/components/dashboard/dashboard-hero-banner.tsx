"use client";

import { useCurrentUser } from "@/services/auth/queries/auth.queries";
import { DashboardGreetingCard } from "./dashboard-greeting-card";
import { DashboardStatsGrid } from "./dashboard-stats-grid";

interface DashboardHeroBannerProps {
  userName?: string;
  upcomingCount?: number;
  stats?: {
    label: string;
    value: number | string;
    subtext?: string;
  }[];
  isLoading?: boolean;
  showBookButton?: boolean;
}

export function DashboardHeroBanner({
  userName,
  upcomingCount = 0,
  stats,
  isLoading = false,
  showBookButton = true,
}: DashboardHeroBannerProps) {
  const { data: user } = useCurrentUser();
  const displayFirstName = userName || user?.firstName || "";

  return (
    <div
      className="relative overflow-hidden rounded-[28px] p-4 md:p-6 border border-[#FFA370]/30"
      style={{
        backgroundImage: "url('/dashboard-banner-bg.png')",
        backgroundSize: "400px 400px",
        backgroundRepeat: "repeat",
        backgroundPosition: "top left",
      }}
    >
      {/* Semi-transparent overlay to ensure soft harmonious tones */}
      <div className="relative z-10 flex flex-col gap-4 md:gap-5">
        <DashboardGreetingCard
          userName={displayFirstName}
          upcomingCount={upcomingCount}
          isLoading={isLoading}
          showBookButton={showBookButton}
        />
        <DashboardStatsGrid stats={stats} isLoading={isLoading} />
      </div>
    </div>
  );
}
