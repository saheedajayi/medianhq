"use client";

import type { ReactNode } from "react";
import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";
import type { ApiError } from "@/services/api-client";

export const cardClass = "rounded-2xl border border-[#EAECF0] bg-white p-6";
export const cardTitleClass = "text-lg font-medium text-[#101828]";
export const inputClass =
  "h-12 w-full rounded-xl border border-[#D0D5DD] bg-white px-3 text-base text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 disabled:text-[#667085]";
/** Grey fill for fields shown as locked, like the email address */
export const filledInputClass = `${inputClass} !bg-[#F2F4F7]`;
export const textareaClass = `${inputClass} h-[120px] resize-none py-2.5`;
export const selectTriggerClass =
  "!h-12 w-full rounded-xl border-[#D0D5DD] bg-white px-3 text-base shadow-none disabled:cursor-default disabled:opacity-100";
export const outlineButtonClass =
  "inline-flex h-9 items-center justify-center rounded-full border border-[#FF8D62] bg-white px-3.5 text-sm font-medium text-[#FF5514] transition hover:bg-[#FDF9F6] disabled:opacity-60";
export const neutralButtonClass =
  "inline-flex h-9 items-center justify-center rounded-full border border-[#D0D5DD] bg-white px-3.5 text-sm font-medium text-[#344054] transition hover:bg-[#F2F4F7] disabled:opacity-60";

export function Field({
  id,
  label,
  error,
  children,
}: {
  id?: string;
  label: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[#101828]">
        {label}
      </label>
      {children}
      {error && <span className="text-xs font-medium text-[#D92D20]">{error}</span>}
    </div>
  );
}

export const getApiMessage = (error: unknown, fallback: string) => {
  const { status, message } = error as Partial<ApiError>;
  return status && status >= 400 && status < 500 && message ? message : fallback;
};

export function TabError({ onRetry, isRetrying }: { onRetry: () => void; isRetrying?: boolean }) {
  return (
    <div role="alert" className={`${cardClass} flex flex-col items-center py-12 text-center`}>
      <h2 className="text-base font-semibold text-[#101828]">We couldn&apos;t load this section</h2>
      <p className="mt-1 text-sm text-[#667085]">Check your connection and try again.</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className={`${outlineButtonClass} mt-4`}
      >
        {isRetrying ? "Trying again..." : "Try again"}
      </button>
    </div>
  );
}

export function FormSkeleton({ rows = 4, label }: { rows?: number; label: string }) {
  return (
    <SkeletonGroup label={label} className={`${cardClass} flex flex-col gap-5`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ))}
    </SkeletonGroup>
  );
}
