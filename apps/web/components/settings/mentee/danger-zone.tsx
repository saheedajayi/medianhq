"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/base/dialog";
import type { DeletionSchedule } from "@/services/account";
import {
  useCancelAccountDeletion,
  useConfirmAccountDeletion,
  useDeactivateAccount,
  useScheduleAccountDeletion,
} from "@/services/account/queries/account.queries";
import { useCurrentUser } from "@/services/auth/queries/auth.queries";
import { getApiMessage, inputClass } from "./shared";

const dangerOutlineClass =
  "inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-[#D92D20] bg-white px-3.5 text-sm font-medium text-[#D92D20] transition hover:bg-[#FEF3F2] disabled:cursor-not-allowed disabled:opacity-50";
const wideButtonClass =
  "inline-flex h-11 w-full items-center justify-center rounded-full px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
const wideNeutralClass = `${wideButtonClass} border border-[#EAECF0] bg-white text-[#101828] hover:bg-[#F7F8FB]`;
const wideDangerClass = `${wideButtonClass} bg-[#D92D20] text-white hover:bg-[#B42318]`;
const widePrimaryClass = `${wideButtonClass} bg-[#FF5514] text-white hover:bg-[#E64A0F]`;

type Step = "deactivate" | "deactivated" | "delete" | "scheduled";

function DangerRow({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <h3 className="text-sm font-medium text-[#101828]">{title}</h3>
        <p className="mt-1 max-w-[440px] text-xs leading-relaxed text-[#475467]">{description}</p>
      </div>
      {action}
    </div>
  );
}

/** The centred dialog every step of this flow shares: close button, maroon title, then the body */
function FlowDialog({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="gap-4 rounded-[20px] bg-white p-6 sm:max-w-[480px]"
      >
        <DialogClose
          aria-label="Close"
          className="ml-auto flex size-9 items-center justify-center rounded-full bg-[#F7F8FB] text-[#101828] transition hover:bg-[#EAECF0]"
        >
          <X className="size-4" />
        </DialogClose>
        <DialogTitle className="text-center text-2xl font-semibold text-[#4B100D]">
          {title}
        </DialogTitle>
        <DialogDescription className="text-center text-sm leading-relaxed text-[#101828]">
          {description}
        </DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function ErrorText({ children }: { children: string }) {
  if (!children) return null;
  return (
    <p role="alert" className="text-center text-sm font-medium text-[#D92D20]">
      {children}
    </p>
  );
}

export function DangerZone() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const deactivate = useDeactivateAccount();
  const scheduleDeletion = useScheduleAccountDeletion();
  const confirmDeletion = useConfirmAccountDeletion();
  const cancelDeletion = useCancelAccountDeletion();

  const [step, setStep] = useState<Step | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [password, setPassword] = useState("");
  const [schedule, setSchedule] = useState<DeletionSchedule | null>(null);
  const [error, setError] = useState("");

  // Google and LinkedIn accounts have no password to re-enter
  const needsPassword = user?.hasPassword !== false;
  const isBusy =
    deactivate.isPending ||
    scheduleDeletion.isPending ||
    confirmDeletion.isPending ||
    cancelDeletion.isPending;

  const reset = () => {
    setStep(null);
    setAcknowledged(false);
    setPassword("");
    setError("");
  };

  const close = () => {
    if (!isBusy) reset();
  };

  const run = async (action: () => Promise<void>) => {
    setError("");
    try {
      await action();
    } catch (err) {
      setError(getApiMessage(err, "Something went wrong. Please try again."));
    }
  };

  /** The session has already ended on the server, so leave for the sign-in page */
  const leave = () => {
    queryClient.clear();
    router.replace("/signin");
  };

  const handleDeactivate = () =>
    run(async () => {
      await deactivate.mutateAsync();
      setStep("deactivated");
    });

  const handleScheduleDeletion = () =>
    run(async () => {
      const result = await scheduleDeletion.mutateAsync({
        acknowledged,
        password: needsPassword ? password : undefined,
      });
      setSchedule(result);
      setStep("scheduled");
    });

  const handleConfirmDeletion = () =>
    run(async () => {
      await confirmDeletion.mutateAsync();
      leave();
    });

  const handleCancelDeletion = () =>
    run(async () => {
      await cancelDeletion.mutateAsync();
      toast.success("Deletion cancelled", { description: "Your account is staying as it is." });
      reset();
    });

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] p-6">
      <h2 className="text-lg font-medium text-[#D92D20]">Danger Zone</h2>

      <DangerRow
        title="Deactivate account"
        description="Temporarily pause your account and hide your activity. You can reactivate anytime."
        action={
          <button type="button" onClick={() => setStep("deactivate")} className={dangerOutlineClass}>
            Deactivate
          </button>
        }
      />
      <DangerRow
        title="Delete account"
        description="Permanently erase your account and personal data, per your right to erasure under NDPR. This can't be undone."
        action={
          <button type="button" onClick={() => setStep("delete")} className={dangerOutlineClass}>
            Delete account
          </button>
        }
      />

      <FlowDialog
        open={step === "deactivate"}
        onClose={close}
        title="Deactivate your Account"
        description="Your profile will be hidden and you won't receive new bookings. Any scheduled sessions will be cancelled and refunded. You can reactivate anytime by logging back in."
      >
        <ErrorText>{error}</ErrorText>
        <div className="mt-2 flex flex-col gap-3">
          <button type="button" disabled={isBusy} onClick={close} className={wideNeutralClass}>
            Cancel
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={handleDeactivate}
            className={wideDangerClass}
          >
            {deactivate.isPending ? "Deactivating..." : "Deactivate account"}
          </button>
        </div>
      </FlowDialog>

      {/* Deactivating already signed the account out, so every way out of this goes to sign-in */}
      <FlowDialog
        open={step === "deactivated"}
        onClose={leave}
        title="Account Deactivated"
        description="Your account has been deactivated. Your profile is hidden and you won't receive new bookings until you log back in. Your data is still intact and you can reactivate anytime."
      >
        <button type="button" onClick={leave} className={`${widePrimaryClass} mt-2`}>
          Done
        </button>
      </FlowDialog>

      <FlowDialog
        open={step === "delete"}
        onClose={close}
        title="Delete your Account"
        description="This permanently erases your account and personal data, in line with your right to erasure under NDPR."
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleScheduleDeletion();
          }}
        >
          <ul className="flex list-disc flex-col gap-2 pl-5 text-xs text-[#101828]">
            <li>Your profile, bio, and session history will be permanently removed</li>
            <li>Any upcoming sessions will be cancelled and refunded</li>
            <li>This can&apos;t be undone once the grace period ends</li>
          </ul>

          <label className="flex items-start gap-2 text-xs text-[#D92D20]">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 size-3.5 accent-[#D92D20]"
            />
            I understand this action is permanent after the grace period.
          </label>

          {needsPassword && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="delete-password" className="text-xs font-medium text-[#101828]">
                Enter your password
              </label>
              <input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="**********"
                className={inputClass}
              />
            </div>
          )}

          <ErrorText>{error}</ErrorText>

          <button
            type="submit"
            disabled={isBusy || !acknowledged || (needsPassword && !password)}
            className={`${wideDangerClass} mt-2`}
          >
            {scheduleDeletion.isPending ? "Scheduling..." : "Delete Account"}
          </button>
        </form>
      </FlowDialog>

      {/* The deletion is already booked here, so closing counts as confirming it */}
      <FlowDialog
        open={step === "scheduled"}
        onClose={() => !isBusy && handleConfirmDeletion()}
        title="Deletion Scheduled"
        description={
          schedule
            ? `Your account is scheduled for permanent deletion in ${schedule.graceDays} days, on ${format(new Date(schedule.scheduledFor), "d MMMM yyyy")}. Until then, your profile stays hidden but your data is safe. You can log back in any time before the deadline to cancel.`
            : ""
        }
      >
        <ErrorText>{error}</ErrorText>
        <div className="mt-2 flex flex-col gap-3">
          <button
            type="button"
            disabled={isBusy}
            onClick={handleCancelDeletion}
            className={wideNeutralClass}
          >
            {cancelDeletion.isPending ? "Cancelling..." : "Cancel deletion and log in"}
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={handleConfirmDeletion}
            className={wideDangerClass}
          >
            {confirmDeletion.isPending ? "Signing out..." : "Confirm deletion"}
          </button>
        </div>
      </FlowDialog>
    </section>
  );
}
