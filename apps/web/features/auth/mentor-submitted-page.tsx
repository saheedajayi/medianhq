"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/base/button";
import { Check } from "lucide-react";

export function MentorSubmittedPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-8 flex size-16 items-center justify-center rounded-full border border-[#e2e8f0] bg-white">
        <div className="flex size-8 items-center justify-center rounded-full border-[2px] border-[#111827]">
          <Check className="size-5 text-[#111827]" strokeWidth={3} />
        </div>
      </div>

      <h1 className="mb-4 text-[32px] font-bold tracking-[-0.02em] text-[#4b100d]">
        Submitted!
      </h1>

      <p className="mb-10 max-w-[440px] text-lg text-[#344054] leading-relaxed">
        Your application has been successfully submitted. You&apos;ll
        get an email when the team verifies your profile.
      </p>

      <Button
        onClick={() => router.replace("/dashboard")}
        className="h-14 w-full rounded-full bg-primary text-base font-medium text-white shadow-none hover:bg-primary/90 sm:w-[320px]"
      >
        Go to Dashboard
      </Button>
    </div>
  );
}
