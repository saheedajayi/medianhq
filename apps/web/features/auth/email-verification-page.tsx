"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/base/button";
import { Input } from "@/components/ui/base/input";
import { Label } from "@/components/ui/base/label";

export function EmailVerificationPage({ email }: { email: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    setIsSubmitting(false);
    router.push("/role-selection");
  }

  function handleResend() {
    toast.info("Resend is not connected yet", {
      description: "The verification-code API still needs to be implemented.",
    });
  }

  return (
    <>
      <header className="text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#4b100d]">
          Check your email
        </h1>
        <p className="mt-2 text-base leading-6 text-[#344054]">
          Enter the verification code we sent to
          <strong className="block font-semibold">{email}</strong>
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-14 grid gap-8">
        <div className="grid gap-2">
          <Label
            htmlFor="verificationCode"
            className="text-sm font-normal text-[#141c2e]"
          >
            Code
          </Label>
          <Input
            id="verificationCode"
            name="verificationCode"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            placeholder="Enter code here"
            className="h-12 rounded-lg border-[#cbd5e1] bg-white px-4 text-base text-[#141c2e] placeholder:text-[#98a2b3] focus-visible:border-primary focus-visible:ring-primary/15"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 rounded-full bg-[#FF5514] text-base font-medium text-white hover:bg-[#e84d12]"
        >
          {isSubmitting ? "Checking code..." : "Continue"}
        </Button>

        <button
          type="button"
          onClick={handleResend}
          className="justify-self-center text-base font-medium text-[#FF5514] hover:underline"
        >
          Resend Code
        </button>
      </form>
    </>
  );
}
