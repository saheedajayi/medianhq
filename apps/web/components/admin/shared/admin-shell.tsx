"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { HambergerMenu } from "iconsax-react";
import { useCurrentUser } from "@/services/auth/queries/auth.queries";
import { AdminSidebar } from "./admin-sidebar";

interface AdminShellProps {
  children: React.ReactNode;
  /** From the session cookie, so an admin sees the page on first paint */
  isAdminHint?: boolean;
}

export function AdminShell({ children, isAdminHint = false }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // undefined is still loading, null is signed out
  const isAdmin = user === undefined ? isAdminHint : user?.role === "ADMIN";

  useEffect(() => {
    if (user === null) {
      router.replace(`/signin?redirect=${encodeURIComponent(pathname ?? "/admin")}`);
    } else if (user && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, pathname, router]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F9FAFB] text-[#101828]">
      <AdminSidebar isMobileOpen={isMobileNavOpen} onMobileClose={() => setIsMobileNavOpen(false)} />

      <div className="flex h-screen flex-1 flex-col overflow-hidden lg:pl-60">
        {/* Top Header Bar (Mobile & Tablet only, hidden on desktop) */}
        <header className="flex h-16 shrink-0 items-center gap-3.5 border-b border-[#EAECF0] bg-white px-4 sm:px-8 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open navigation menu"
            className="flex size-9 items-center justify-center rounded-full border border-[#EAECF0] bg-[#F7F8FB] transition-colors hover:bg-[#EAECF0]"
          >
            <HambergerMenu size="18" variant="Linear" color="#344054" />
          </button>
          <Image
            src="/median-logo.svg"
            alt="Median Logo"
            width={100}
            height={26}
            className="h-6 w-auto object-contain"
            priority
          />
        </header>

        {/* Page content enclosed in the single curved white canvas */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white lg:my-2 lg:mr-2 lg:rounded-[20px] lg:border lg:border-[#EAECF0]">
          <main className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7 md:p-8">
            {/* Nothing is shown to a non-admin while they are redirected */}
            <div className="mx-auto w-full max-w-7xl">{isAdmin ? children : null}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
