"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUnsubscribe } from "@/services/emails/queries/emails.queries";
import { LandingFooter, LandingHeader } from "../shared";

/**
 * Opened from "Unsubscribe" in an email. It asks first rather than
 * unsubscribing on load, so mail scanners that open links can't do it.
 */
export function LandingUnsubscribePage() {
  const params = useSearchParams();
  const userId = params.get("u") ?? "";
  const token = params.get("t") ?? "";
  const unsubscribe = useUnsubscribe();
  const hasLink = Boolean(userId && token);

  let title = "Unsubscribe from Median tips?";
  let body =
    "You'll stop getting the getting-started series and other tips from Mide. You'll still get emails about your account, bookings and payments.";
  if (!hasLink) {
    title = "This link is incomplete";
    body = "Open the Unsubscribe link from your email again, or change your emails in Settings.";
  } else if (unsubscribe.isSuccess) {
    title = "You're unsubscribed";
    body =
      "We won't send you tips anymore. You'll still get emails about your account, bookings and payments. You can turn tips back on in Settings.";
  }

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <LandingHeader />
      <section className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-semibold text-[#101828] sm:text-4xl">{title}</h1>
        <p className="mt-4 text-base leading-relaxed text-[#475467]">{body}</p>

        {unsubscribe.isError && (
          <p role="alert" className="mt-4 text-sm font-medium text-red-600">
            {unsubscribe.error.message || "We couldn't unsubscribe you. Please try again."}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {hasLink && !unsubscribe.isSuccess && (
            <button
              type="button"
              onClick={() => unsubscribe.mutate({ userId, token })}
              disabled={unsubscribe.isPending}
              className="rounded-full bg-[#FF5514] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[#E84D12] disabled:opacity-60"
            >
              {unsubscribe.isPending ? "Unsubscribing..." : "Unsubscribe"}
            </button>
          )}
          <Link
            href="/settings?tab=notifications"
            className="rounded-full border border-[#D0D5DD] px-6 py-3 text-base font-medium text-[#344054] transition-colors hover:bg-[#F9FAFB]"
          >
            Email settings
          </Link>
        </div>
      </section>
      <LandingFooter />
    </main>
  );
}
