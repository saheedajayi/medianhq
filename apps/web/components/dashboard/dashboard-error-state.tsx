"use client";

import { Loader2, RefreshCw } from "lucide-react";

interface DashboardErrorStateProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

/** Shown instead of the dashboard when its data can't be loaded, so it never looks like endless loading */
export function DashboardErrorState({ onRetry, isRetrying = false }: DashboardErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-[#EAECF0] bg-white px-6 py-12 text-center"
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#FFEEE8]">
        <RefreshCw className="size-6 text-[#FF5514]" />
      </div>
      <h1 className="text-lg font-semibold text-[#101828]">We couldn&apos;t load your dashboard</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#667085]">
        This is usually temporary. Check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5514] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#E04406] active:scale-[0.98] disabled:opacity-60"
      >
        {isRetrying && <Loader2 className="size-4 animate-spin" />}
        {isRetrying ? "Trying again..." : "Try again"}
      </button>
    </div>
  );
}
