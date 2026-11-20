"use client";

import { useRef } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/admin/shared/shared";
import type { SessionEarning, SessionEarningDetails } from "@/services/earnings";
import { useSessionEarning } from "@/services/earnings/queries/earnings.queries";
import { cn } from "@/lib/utils";
import { DrawerLoadError, DrawerRow, DrawerSkeleton, EarningsDrawer, drawerSectionClass } from "./earnings-drawer";
import {
  EARNING_STATUS,
  chipClass,
  formatFullDate,
  formatNaira,
  outlineButtonClass,
  pendingNote,
  primaryButtonClass,
} from "./earnings-utils";

/** Net earning reads differently once the money is held or taken back */
function NetEarning({ earning }: { earning: SessionEarningDetails }) {
  if (earning.status === "DISPUTED") return <span className="text-[#FF5514]">₦-</span>;
  if (earning.status === "REFUNDED") {
    return <span className="text-[#D92D20]">-{formatNaira(earning.netAmount)}</span>;
  }
  return <span className="text-[#FF5514]">{formatNaira(earning.netAmount)}</span>;
}

function PayoutNote({ earning }: { earning: SessionEarningDetails }) {
  if (earning.status === "PAID_OUT") return null;

  if (earning.status === "REFUNDED") {
    return (
      <div className="rounded-xl bg-[#FEE9E7] p-4 text-sm leading-5 text-[#D92D20]">
        <p className="font-medium">Earnings reversed</p>
        <p className="mt-1.5">
          The mentee was refunded for this session. {formatNaira(earning.netAmount)} was deducted from your wallet
          balance{earning.refundedAt ? ` on ${formatFullDate(earning.refundedAt)}` : ""}.
        </p>
      </div>
    );
  }

  if (earning.status === "DISPUTED") {
    return (
      <div className="rounded-xl bg-[#F7F8FB] p-4 text-sm leading-5 text-[#475467]">
        <p className="font-medium text-[#101828]">This session was flagged for review</p>
        <p className="mt-1.5">
          Mentee reported an issue with this session. Payout is on hold until Median&apos;s support team reviews it,
          usually within 3 business days. You&apos;ll be notified of the outcome.
        </p>
      </div>
    );
  }

  return <p className="rounded-xl bg-[#F7F8FB] p-4 text-sm leading-5 text-[#475467]">{pendingNote(earning)}</p>;
}

/** The buttons under an earning; a held or reversed one leads with where to read more */
function EarningActions({ status }: { status: SessionEarningDetails["status"] }) {
  return (
    <div className="mt-12 flex flex-col gap-3">
      {status === "DISPUTED" && (
        <Link href="/contact" className={primaryButtonClass}>
          View dispute details
        </Link>
      )}
      {status === "REFUNDED" && (
        <Link href="/terms" className={primaryButtonClass}>
          View refund policy
        </Link>
      )}
      <Link href="/mentor/bookings?tab=past" className={outlineButtonClass}>
        View session details
      </Link>
    </div>
  );
}

interface EarningDetailsDrawerProps {
  /** The row that was opened, or null when the drawer is closed */
  earning: SessionEarning | null;
  onClose: () => void;
}

/** One session's earning in full: who it was with, what was earned, and where the payout stands */
export function EarningDetailsDrawer({ earning, onClose }: EarningDetailsDrawerProps) {
  // Keeps the content in place while the drawer slides shut
  const lastEarning = useRef(earning);
  if (earning) lastEarning.current = earning;
  const row = earning ?? lastEarning.current;
  const { data, isError, isFetching, refetch } = useSessionEarning(row?.id ?? null);
  const details = data?.id === row?.id ? data : undefined;

  return (
    <EarningsDrawer
      isOpen={!!earning}
      onClose={onClose}
      title="Session earning details"
      subtitle={row ? `${row.sessionTitle} · ${formatFullDate(row.date)}` : ""}
    >
      {details ? (
        <>
          <div className="flex items-center gap-4">
            <UserAvatar name={details.mentee.name} avatarUrl={details.mentee.avatarUrl} className="size-12 text-base" />
            <div>
              <p className="text-base font-medium text-[#101828]">{details.mentee.name}</p>
              {details.mentee.role && <p className="mt-1 text-sm text-[#475467]">{details.mentee.role}</p>}
            </div>
          </div>

          <h3 className={cn(drawerSectionClass, "mt-5")}>Earnings breakdown</h3>
          <dl className="mt-3 flex flex-col gap-2.5">
            <DrawerRow label="Session price">{formatNaira(details.grossAmount)}</DrawerRow>
            <DrawerRow label="Service charge">-{formatNaira(details.serviceCharge)}</DrawerRow>
            <DrawerRow label="Net earning" isTotal>
              <NetEarning earning={details} />
            </DrawerRow>
          </dl>

          <hr className="-mx-8 my-4 border-[#EAECF0]" />

          <h3 className={drawerSectionClass}>Payout details</h3>
          <dl className="mt-3 mb-3 flex flex-col gap-2.5">
            <DrawerRow label="Payout status">
              <span className={cn(chipClass, EARNING_STATUS[details.status].className)}>
                {EARNING_STATUS[details.status].label}
              </span>
            </DrawerRow>
            {details.paidOutAt && <DrawerRow label="Payout date">{formatFullDate(details.paidOutAt)}</DrawerRow>}
          </dl>
          <PayoutNote earning={details} />

          <EarningActions status={details.status} />
        </>
      ) : isError ? (
        <DrawerLoadError message="We couldn't load this earning." isRetrying={isFetching} onRetry={() => refetch()} />
      ) : (
        <DrawerSkeleton label="Loading earning" />
      )}
    </EarningsDrawer>
  );
}
