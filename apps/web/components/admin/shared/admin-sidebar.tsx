"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Add,
  Calendar,
  DocumentText,
  Element3,
  FolderOpen,
  Logout,
  Profile2User,
  Setting2,
  ShieldTick,
  Wallet,
} from "iconsax-react";
import type { AdminSection } from "@/services/auth/types";
import { useCurrentUser, useLogout } from "@/services/auth/queries/auth.queries";
import { ADMIN_ROLE_NAMES, useAdminAccess } from "./admin-access";

interface NavItem {
  label: string;
  href: string;
  section: AdminSection;
  icon: typeof Element3;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/admin", section: "overview", icon: Element3 },
  { label: "Users", href: "/admin/users", section: "users", icon: Profile2User },
  { label: "Applications", href: "/admin/applications", section: "applications", icon: DocumentText },
  { label: "Sessions", href: "/admin/sessions", section: "sessions", icon: FolderOpen },
  { label: "Bookings", href: "/admin/bookings", section: "sessions", icon: Calendar },
  { label: "Moderation", href: "/admin/moderation", section: "moderation", icon: ShieldTick },
  { label: "Finance", href: "/admin/finance", section: "finance", icon: Wallet },
  { label: "Analytics", href: "/admin/analytics", section: "analytics", icon: Activity },
  { label: "Settings", href: "/admin/settings", section: "settings", icon: Setting2 },
];

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({ isMobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const logoutMutation = useLogout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { adminRole, canRead } = useAdminAccess();

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      // Clears the query cache once the request settles
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      router.push("/signin");
      router.refresh();
    }
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between px-2">
          <Link href="/admin" onClick={onMobileClose} className="flex items-center gap-2">
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
              className="flex size-8 items-center justify-center rounded-full bg-[#F7F8FB] transition-colors hover:bg-[#EAECF0] lg:hidden"
            >
              <Add size="20" variant="Linear" color="#101828" className="rotate-45" />
              <span className="sr-only">Close sidebar</span>
            </button>
          )}
        </div>

        <nav aria-label="Admin" className="flex flex-col gap-1">
          {/* Only the sections this admin's type opens */}
          {navItems.filter((item) => canRead(item.section)).map((item) => {
            const Icon = item.icon;
            // Overview is the admin root, so it only matches exactly
            const isActive = item.href === "/admin" ? pathname === item.href : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onMobileClose}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#FFEEE8] font-semibold text-[#FF5514]!"
                    : "text-[#475467]! hover:bg-[#F2F4F7] hover:text-[#101828]!"
                }`}
              >
                <Icon
                  size="18"
                  variant={isActive ? "Bulk" : "Outline"}
                  color={isActive ? "#FF5514" : "#667085"}
                  className="shrink-0"
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-5 border-t border-[#EAECF0] px-1 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F2F4F7] text-sm font-semibold text-[#475467]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#101828]">
              {user ? `${user.firstName} ${user.lastName}` : ""}
            </p>
            <span className="mt-0.5 inline-block rounded-full bg-[#FFEEE8] px-2 py-0.5 text-[11px] font-medium text-[#E84D12]">
              {adminRole ? ADMIN_ROLE_NAMES[adminRole] : "Admin"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center justify-center gap-2 py-1 text-lg text-[#F04438] transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          <Logout size="22" variant="Outline" color="#F04438" />
          {isLoggingOut ? "Logging out..." : "Log Out"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar (visible from lg: 1024px and up) */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-60 flex-col bg-[#F9FAFB] px-5 py-6 lg:flex">
        {navContent}
      </aside>

      {/* Mobile & Tablet Drawer (below lg: 1024px) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="relative z-10 flex h-full w-64 max-w-[80vw] flex-col bg-[#F9FAFB] px-5 py-6 transition-transform animate-in slide-in-from-left duration-200">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
