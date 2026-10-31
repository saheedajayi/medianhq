"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { format, isToday, isYesterday } from "date-fns";
import { Laptop, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";
import { changePasswordSchema } from "@/features/auth/change-password-form";
import type { DeviceSession } from "@/services/auth/types";
import {
  useChangePassword,
  useCurrentUser,
  useDeviceSessions,
  useRevokeOtherSessions,
} from "@/services/auth/queries/auth.queries";
import {
  cardClass,
  cardTitleClass,
  Field,
  getApiMessage,
  filledInputClass,
  outlineButtonClass,
  TabError,
} from "./shared";

const formatLastActive = (value: string) => {
  const date = new Date(value);
  if (isToday(date)) return `Today · ${format(date, "HH:mm")}`;
  if (isYesterday(date)) return `Yesterday · ${format(date, "HH:mm")}`;
  return format(date, "d MMM yyyy · HH:mm");
};

function SessionRow({ session }: { session: DeviceSession }) {
  const Icon = session.isMobile ? Smartphone : Laptop;
  return (
    <li className="flex items-center justify-between gap-3 border-b border-[#EAECF0] py-4 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F7F8FB]">
          <Icon className="size-4 text-[#475467]" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm text-[#101828]">
            {session.label}
            {session.location && ` · ${session.location}`}
          </p>
          <p className="mt-0.5 text-xs text-[#667085]">
            {session.isCurrent ? "Active now" : formatLastActive(session.lastActiveAt)}
          </p>
        </div>
      </div>
      {session.isCurrent && (
        <span className="shrink-0 rounded-full bg-[#ECFDF3] px-2.5 py-1 text-xs text-[#067647]">
          Active Now
        </span>
      )}
    </li>
  );
}

function ActiveSessions() {
  const { data, isLoading, isError, isFetching, refetch } = useDeviceSessions();
  const revoke = useRevokeOtherSessions();

  if (isError) return <TabError onRetry={() => refetch()} isRetrying={isFetching} />;

  const hasOtherSessions = !!data?.some((session) => !session.isCurrent);

  return (
    <section className={cardClass}>
      <h2 className={cardTitleClass}>Active Sessions</h2>

      {isLoading || !data ? (
        <SkeletonGroup label="Loading your sessions" className="mt-4 flex flex-col gap-4">
          {[0, 1].map((row) => (
            <div key={row} className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          ))}
        </SkeletonGroup>
      ) : (
        <ul className="mt-2">
          {data.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </ul>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={!hasOtherSessions || revoke.isPending}
          onClick={() =>
            revoke
              .mutateAsync()
              .then(() => toast.success("Signed out of all other sessions"))
              .catch((err) =>
                toast.error(getApiMessage(err, "We couldn't sign out your other sessions."))
              )
          }
          className="inline-flex h-9 items-center justify-center rounded-full border border-[#D92D20] bg-white px-3.5 text-sm font-medium text-[#D92D20] transition hover:bg-[#FEF3F2] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {revoke.isPending ? "Signing out..." : "Sign out of all other sessions"}
        </button>
      </div>
    </section>
  );
}

export function SecurityTab() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const changePassword = useChangePassword();
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = changePasswordSchema.safeParse({
      currentPassword: String(formData.get("currentPassword") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    });

    setErrors({});
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword: result.data.currentPassword,
        password: result.data.password,
      });
      toast.success("Password changed", {
        description: "Please sign in again with your new password.",
      });
      router.replace("/signin");
    } catch (err) {
      const message = getApiMessage(err, "Unable to change password. Please try again.");
      setErrors({ [message.includes("Current password") ? "currentPassword" : "password"]: [message] });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className={`${cardClass} flex flex-col gap-2`}>
        <Field id="account-email" label="Email address">
          <input id="account-email" value={user?.email ?? ""} disabled className={filledInputClass} />
        </Field>
        {/* Changing an email has no self-serve flow yet, so this goes to support */}
        <a href="mailto:hello@median.co?subject=Email%20change%20request" className="self-start text-sm underline">
          <span className="text-[#FF5514]">Request email change</span>
        </a>
      </section>

      <form onSubmit={handleSubmit} noValidate className={`${cardClass} flex flex-col gap-4`}>
        <Field id="currentPassword" label="Current Password" error={errors.currentPassword?.[0]}>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            placeholder="**********"
            className={filledInputClass}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field id="password" label="New password" error={errors.password?.[0]}>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="**********"
              className={filledInputClass}
            />
          </Field>
          <Field id="confirmPassword" label="Confirm new password" error={errors.confirmPassword?.[0]}>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="**********"
              className={filledInputClass}
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={changePassword.isPending} className={outlineButtonClass}>
            {changePassword.isPending ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>

      <ActiveSessions />
    </div>
  );
}
