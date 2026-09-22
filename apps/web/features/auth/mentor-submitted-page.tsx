"use client";

import { Button } from "@/components/ui/base/button";
import Link from "next/link";
import { SubmittedCheckIcon } from "@/components/ui/submitted-check-icon";

export function MentorSubmittedPage() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-8">
        <SubmittedCheckIcon />
      </div>

      <h1 className="mb-4 text-[32px] font-bold tracking-[-0.02em] text-[#4b100d]">
        Submitted!
      </h1>

      <p className="mb-10 max-w-[440px] text-lg text-[#344054] leading-relaxed">
        Your application has been successfully submitted. You&apos;ll
        get an email when the team verifies your profile.
      </p>

      <Button
        asChild
        className="h-14 w-full rounded-full bg-primary text-base font-medium !text-white shadow-none hover:bg-primary/90 sm:w-[320px]"
      >
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
