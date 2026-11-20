"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/base/sheet";
import { cn } from "@/lib/utils";

export const drawerSectionClass = "text-sm tracking-wide text-[#475467] uppercase";

interface EarningsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  children: ReactNode;
}

/** The panel that slides in from the right for one earning or one payout */
export function EarningsDrawer({ isOpen, onClose, title, subtitle, children }: EarningsDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border border-[#EAECF0] bg-white p-0 sm:top-2 sm:right-2 sm:bottom-2 sm:h-[calc(100vh-16px)] sm:max-w-[600px] sm:rounded-[20px]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#EAECF0] px-8 pt-10 pb-4">
          <div>
            <SheetTitle className="text-2xl font-semibold text-[#101828]">{title}</SheetTitle>
            <SheetDescription className="mt-3 text-base text-[#475467]">{subtitle}</SheetDescription>
          </div>
          <SheetClose className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F7F8FB] text-[#101828] transition-colors hover:bg-[#EAECF0]">
            <X className="size-4" strokeWidth={2.5} />
            <span className="sr-only">Close</span>
          </SheetClose>
        </header>
        <div className="flex-1 overflow-y-auto px-8 pt-4 pb-8">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

interface DrawerRowProps {
  label: string;
  children: ReactNode;
  /** The row the others lead up to */
  isTotal?: boolean;
}

export function DrawerRow({ label, children, isTotal = false }: DrawerRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className={isTotal ? "text-base font-semibold text-[#101828]" : "text-sm text-[#667085]"}>{label}</dt>
      <dd className={cn("text-base text-[#101828]", isTotal && "font-semibold")}>{children}</dd>
    </div>
  );
}

interface DrawerLoadErrorProps {
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export function DrawerLoadError({ message, isRetrying, onRetry }: DrawerLoadErrorProps) {
  return (
    <div role="alert" className="rounded-xl bg-[#F7F8FB] p-4 text-sm text-[#475467]">
      <p>{message}</p>
      <button
        type="button"
        disabled={isRetrying}
        onClick={onRetry}
        className="mt-2 font-medium text-[#FF5514] hover:underline disabled:opacity-60"
      >
        {isRetrying ? "Trying again..." : "Try again"}
      </button>
    </div>
  );
}

/** Stands in for a drawer's label-and-value rows while they load */
export function DrawerSkeleton({ label }: { label: string }) {
  return (
    <SkeletonGroup label={label} className="space-y-4 pt-2">
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="flex justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </SkeletonGroup>
  );
}
