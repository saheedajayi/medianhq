"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Element4,
  Global,
  Calendar,
  Messages2,
  MessageQuestion,
  Profile2User,
  MedalStar,
  Setting2,
  Logout,
} from "iconsax-react";
import { authService } from "@/services/auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number | string; color?: string; variant?: "Linear" | "Outline" | "Bold" | "Broken" | "Bulk" | "TwoTone"; className?: string }>;
  variant?: "Outline" | "Linear";
}

const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Element4, variant: "Outline" },
  { label: "Explore", href: "/mentee/explore", icon: Global, variant: "Outline" },
  { label: "Sessions", href: "/mentee/bookings", icon: Calendar, variant: "Outline" },
  { label: "Messages", href: "/mentee/messages", icon: Messages2, variant: "Outline" },
  { label: "Async Q&A", href: "/mentee/async-qa", icon: MessageQuestion, variant: "Outline" },
  { label: "Career Info", href: "/mentee/profile", icon: Profile2User, variant: "Outline" },
  { label: "Achievements", href: "/mentee/achievements", icon: MedalStar, variant: "Outline" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      queryClient.clear();
      router.push("/signin");
      router.refresh();
    }
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-30 h-screen w-64 flex-col justify-between border-r border-[#EAECF0] bg-white px-5 py-6">
      <div className="flex flex-col gap-8">
        {/* Brand Logo */}
        <div className="flex items-center px-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/median-logo.svg"
              alt="Median Logo"
              width={115}
              height={30}
              className="h-7 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Main Navigation Items */}
        <nav className="flex flex-col gap-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#FFF0EB] text-[#FF5500] font-semibold"
                    : "text-[#475467] hover:bg-[#F9FAFB] hover:text-[#101828]"
                }`}
              >
                <Icon
                  size="18"
                  variant={item.variant || "Outline"}
                  color={isActive ? "#FF5500" : "#667085"}
                  className="shrink-0"
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Navigation (Settings & Log Out - No Top Border) */}
      <div className="flex flex-col gap-1">
        <Link
          href="/settings"
          className="flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#475467] transition-all hover:bg-[#F9FAFB] hover:text-[#101828]"
        >
          <Setting2 size="18" variant="Outline" color="#667085" className="shrink-0" />
          <span>Settings</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#D92D20] transition-all hover:bg-[#FEF3F2] disabled:opacity-50"
        >
          <Logout size="18" variant="Linear" color="#D92D20" className="shrink-0" />
          <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
        </button>
      </div>
    </aside>
  );
}
