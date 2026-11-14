"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Lock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/base/button";
import { FormField, formInputClassName } from "@/components/ui/custom/form-field";
import { PasswordInput } from "@/components/ui/custom/password-input";
import {
  isInviteLoadFailure,
  useAcceptAdminInvite,
  useAdminInvitePreview,
} from "@/services/admin/invites/queries/invites.queries";

const acceptInviteSchema = z
  .object({
    firstName: z.string().trim().min(1, "Enter your first name").max(60, "Keep it under 60 characters"),
    lastName: z.string().trim().min(1, "Enter your last name").max(60, "Keep it under 60 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FieldErrors = Partial<Record<keyof z.infer<typeof acceptInviteSchema>, string[]>>;

const BREACHED_PASSWORD = "Choose a password that has not appeared in a data breach.";

interface AcceptAdminInvitePageProps {
  token: string;
}

/** Where an invited admin sets their name and password, then lands in the admin area */
export function AcceptAdminInvitePage({ token }: AcceptAdminInvitePageProps) {
  const router = useRouter();
  const trimmedToken = token?.trim() ?? "";
  const [errors, setErrors] = useState<FieldErrors>({});
  const { data: invite, isLoading, isFetching, error, refetch } = useAdminInvitePreview(trimmedToken);
  const acceptInvite = useAcceptAdminInvite(trimmedToken);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = acceptInviteSchema.safeParse({
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    });

    setErrors({});
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    const { firstName, lastName, password } = result.data;
    acceptInvite.mutate(
      { firstName, lastName, password },
      {
        onSuccess: () => {
          toast.success("Welcome to Median admin");
          router.replace("/admin");
        },
        onError: (failure) => {
          const message = failure.message || "We couldn't create your account. Please try again.";
          if (message === BREACHED_PASSWORD) setErrors({ password: [message] });
          toast.error("Unable to accept the invite", { description: message });
        },
      },
    );
  };

  if (trimmedToken && isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-[#FF5514] border-t-transparent" />
        <p className="text-sm text-[#667085]">Checking your invite...</p>
      </div>
    );
  }

  // Slow or unreachable server: the link may be fine, so offer to try again rather than calling it expired
  if (!invite && isInviteLoadFailure(error)) {
    return (
      <div className="text-center">
        <header className="mb-6">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[#FFF4ED] text-[#FF5514]">
            <AlertCircle className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#4b100d]">We couldn&apos;t load your invite</h1>
          <p className="mt-2 text-sm text-[#667085]">
            Median took too long to respond. Your invite link is probably fine, so please try again.
          </p>
        </header>
        <Button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-12 w-full rounded-full text-base font-medium text-white"
        >
          <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
          {isFetching ? "Trying again..." : "Try again"}
        </Button>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="text-center">
        <header className="mb-6">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#4b100d]">Invite Invalid or Expired</h1>
          <p className="mt-2 text-sm text-[#667085]">
            This invite link is invalid or has expired. Ask the admin who invited you to send a new one.
          </p>
        </header>
        <Link
          href="/signin"
          className="inline-flex items-center justify-center gap-2 py-2 text-sm font-semibold text-[#344054] hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <>
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#4b100d]">Join Median as an admin</h1>
        <p className="mt-2 text-base text-[#344054]">
          You&apos;ve been invited as {/^[AEIOU]/.test(invite.roleLabel) ? "an" : "a"}{" "}
          <span className="font-semibold">{invite.roleLabel}</span>. Set your name and password to finish.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="grid gap-4">
        {/* Fixed by the invite, so it can't be changed here; autocomplete lets password managers save against it */}
        <FormField id="email" label="Email">
          <div className="relative">
            <input
              id="email"
              type="email"
              name="username"
              autoComplete="username"
              value={invite.email}
              readOnly
              aria-readonly="true"
              tabIndex={-1}
              className={`${formInputClassName} w-full cursor-not-allowed !border-[#EAECF0] !bg-[#F2F4F7] pr-10 !text-[#667085] focus-visible:!ring-0`}
            />
            <Lock aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#98A2B3]" />
          </div>
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="firstName" label="First Name" error={errors.firstName?.[0]}>
            <input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              required
              className={formInputClassName}
              aria-invalid={!!errors.firstName}
            />
          </FormField>
          <FormField id="lastName" label="Last Name" error={errors.lastName?.[0]}>
            <input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              required
              className={formInputClassName}
              aria-invalid={!!errors.lastName}
            />
          </FormField>
        </div>

        <FormField id="password" label="Password" error={errors.password?.[0]}>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            required
            showCriteriaTooltip
            className={formInputClassName}
            placeholder="Min 8 characters"
            aria-invalid={!!errors.password}
          />
        </FormField>

        <FormField id="confirmPassword" label="Confirm Password" error={errors.confirmPassword?.[0]}>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            required
            className={formInputClassName}
            placeholder="Re-enter password"
            aria-invalid={!!errors.confirmPassword}
          />
        </FormField>

        <Button
          type="submit"
          disabled={acceptInvite.isPending}
          className="mt-6 h-12 rounded-full text-base font-medium text-white"
        >
          {acceptInvite.isPending ? "Creating your account..." : "Accept invite"}
        </Button>
      </form>
    </>
  );
}
