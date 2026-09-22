"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Element3,
  Global,
  Calendar,
  CalendarTick,
  FolderOpen,
  Wallet,
  Messages2,
  MessageQuestion,
  Profile2User,
  MedalStar,
  Setting2,
  Logout,
  Add,
} from "iconsax-react";
import { authService } from "@/services/auth";
import { useCurrentUser } from "@/hooks/use-current-user";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{
    size?: number | string;
    color?: string;
    variant?: "Linear" | "Outline" | "Bold" | "Broken" | "Bulk" | "TwoTone";
    className?: string;
  }>;
  variant?: "Outline" | "Linear" | "Bold" | "Bulk";
  activeVariant?: "Outline" | "Linear" | "Bold" | "Bulk";
}

const menteeNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Element3, variant: "Outline", activeVariant: "Bulk" },
  { label: "Explore", href: "/mentee/explore", icon: Global, variant: "Outline", activeVariant: "Bulk" },
  { label: "Bookings", href: "/mentee/booking-session", icon: Calendar, variant: "Outline", activeVariant: "Bulk" },
  { label: "Messages", href: "/mentee/messages", icon: Messages2, variant: "Outline", activeVariant: "Bold" },
  { label: "Async Q&A", href: "/mentee/async-qa", icon: MessageQuestion, variant: "Outline", activeVariant: "Bold" },
  { label: "Community", href: "/mentee/community", icon: Profile2User, variant: "Outline", activeVariant: "Bulk" },
  { label: "Achievements", href: "/mentee/achievements", icon: MedalStar, variant: "Outline", activeVariant: "Bulk" },
];

const mentorNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Element3, variant: "Outline", activeVariant: "Bulk" },
  { label: "Sessions", href: "/mentor/sessions", icon: FolderOpen, variant: "Outline", activeVariant: "Bulk" },
  { label: "Bookings", href: "/mentor/bookings", icon: Calendar, variant: "Outline", activeVariant: "Bulk" },
  { label: "Availability", href: "/mentor/availability", icon: CalendarTick, variant: "Outline", activeVariant: "Bulk" },
  { label: "Messages", href: "/mentor/messages", icon: Messages2, variant: "Outline", activeVariant: "Bold" },
  { label: "Async Q&A", href: "/mentor/async-qa", icon: MessageQuestion, variant: "Outline", activeVariant: "Bold" },
  { label: "Earnings", href: "/mentor/earnings", icon: Wallet, variant: "Outline", activeVariant: "Bulk" },
  { label: "Community", href: "/mentor/community", icon: Profile2User, variant: "Outline", activeVariant: "Bulk" },
  { label: "Achievements", href: "/mentor/achievements", icon: MedalStar, variant: "Outline", activeVariant: "Bulk" },
];

interface DashboardSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  userRole?: "MENTEE" | "MENTOR" | "ADMIN" | null;
}

export function DashboardSidebar({ isMobileOpen = false, onMobileClose, userRole }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const isMentor = (userRole ?? user?.role) === "MENTOR";
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

  const navContent = (
    <div className="flex h-full flex-col justify-between">
      <div className="flex flex-col gap-8">
        {/* Brand Logo & Mobile Close */}
        <div className="flex items-center justify-between px-2">
          <Link href="/dashboard" onClick={onMobileClose} className="flex items-center gap-2">
            <Image
              src="/median-logo.svg"
              alt="Median Logo"
              width={115}
              height={30}
              className="h-7 w-auto object-contain"
              priority
            />
          </Link>
          {onMobileClose && (
            <button
              type="button"
              onClick={onMobileClose}
              className="flex size-8 items-center justify-center rounded-full bg-[#F7F8FB] text-[#101828] transition-colors hover:bg-[#EAECF0] lg:hidden"
            >
              <Add size="20" variant="Linear" color="#101828" className="rotate-45" />
              <span className="sr-only">Close sidebar</span>
            </button>
          )}
        </div>

        {/* Main Navigation Items */}
        <nav className="flex flex-col gap-1">
          {(isMentor ? mentorNavItems : menteeNavItems).map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href)) ||
              (item.label === "Explore" && (pathname === "/explore" || pathname?.startsWith("/mentors/") || pathname?.startsWith("/mentee/mentors/"))) ||
              (item.label === "Bookings" && (pathname === "/bookings" || pathname?.startsWith("/mentee/booking-session") || pathname?.startsWith("/mentee/bookings")));

            const currentVariant = isActive
              ? (item.activeVariant || "Bulk")
              : (item.variant || "Outline");

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onMobileClose}
                className={`flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#FFEEE8] text-[#FF5514] font-semibold"
                    : "text-[#475467] hover:bg-[#F2F4F7] hover:text-[#101828]"
                }`}
              >
                <Icon
                  size="18"
                  variant={currentVariant}
                  color={isActive ? "#FF5514" : "#667085"}
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
          onClick={onMobileClose}
          className={`flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
            pathname?.startsWith("/settings")
              ? "bg-[#FFEEE8] text-[#FF5514] font-semibold"
              : "text-[#475467] hover:bg-[#F2F4F7] hover:text-[#101828]"
          }`}
        >
          <Setting2
            size="18"
            variant={pathname?.startsWith("/settings") ? "Bulk" : "Outline"}
            color={pathname?.startsWith("/settings") ? "#FF5514" : "#667085"}
            className="shrink-0"
          />
          <span>Settings</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#D92D20] transition-all hover:bg-[#FEF3F2] disabled:opacity-50"
        >
          <Logout size="18" variant="Outline" color="#D92D20" className="shrink-0" />
          <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar (visible from lg: 1024px and up) */}
      <aside className="hidden lg:flex fixed left-0 top-0 z-30 h-screen w-60 flex-col bg-[#F9FAFB] px-5 py-6">
        {navContent}
      </aside>

      {/* Mobile & Tablet Drawer (below lg: 1024px) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
            onClick={onMobileClose}
            aria-hidden="true"
          />

          {/* Sliding Drawer Container */}
          <aside className="relative z-10 flex h-full w-64 max-w-[80vw] flex-col bg-[#F9FAFB] px-5 py-6 shadow-2xl transition-transform animate-in slide-in-from-left duration-200">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
