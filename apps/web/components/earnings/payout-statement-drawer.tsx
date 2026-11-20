"use client";

import { useRef } from "react";
import { formatDay } from "@/components/admin/shared/format";
import type { Payout } from "@/services/earnings";
import { usePayoutStatement } from "@/services/earnings/queries/earnings.queries";
import { DrawerLoadError, DrawerRow, DrawerSkeleton, EarningsDrawer, drawerSectionClass } from "./earnings-drawer";
import { formatNaira } from "./earnings-utils";

interface PayoutStatementDrawerProps {
  /** The payout that was opened, or null when the drawer is closed */
  payout: Payout | null;
  onClose: () => void;
}

/** A payout's month in figures: what was earned, what was paid, and the sessions behind it */
export function PayoutStatementDrawer({ payout, onClose }: PayoutStatementDrawerProps) {
  // Keeps the content in place while the drawer slides shut
  const lastPayout = useRef(payout);
  if (payout) lastPayout.current = payout;
  const row = payout ?? lastPayout.current;
  const { data, isError, isFetching, refetch } = usePayoutStatement(row?.id ?? null);
  const statement = data?.id === row?.id ? data : undefined;

  return (
    <EarningsDrawer
      isOpen={!!payout}
      onClose={onClose}
      title="Payout statement"
      subtitle={row ? `Payout summary· ${formatDay(row.requestedAt)}` : ""}
    >
      {statement ? (
        <>
          <div className="flex items-center justify-between gap-4 pt-1">
            <span className="text-sm text-[#475467]">Payout period</span>
            <span className="text-lg font-semibold text-[#344054]">{statement.period}</span>
          </div>

          <h3 className={`${drawerSectionClass} mt-4`}>Summary</h3>
          <dl className="mt-3 flex flex-col gap-2.5">
            <DrawerRow label="Session completed">{statement.sessionsCompleted.toLocaleString("en-NG")}</DrawerRow>
            <DrawerRow label="Gross earnings">{formatNaira(statement.grossEarnings)}</DrawerRow>
            <DrawerRow label="Service charge">-{formatNaira(statement.serviceCharge)}</DrawerRow>
            <DrawerRow label="Net earning">{formatNaira(statement.netEarnings)}</DrawerRow>
            <DrawerRow label="Paid out" isTotal>
              <span className="text-[#FF5514]">{formatNaira(statement.paidOut)}</span>
            </DrawerRow>
            <DrawerRow label="Pending clearance">{formatNaira(statement.pendingClearance)}</DrawerRow>
            <DrawerRow label="Held on dispute">{formatNaira(statement.heldOnDispute)}</DrawerRow>
          </dl>

          <hr className="-mx-8 my-4 border-[#EAECF0]" />

          <h3 className={drawerSectionClass}>Session breakdown</h3>
          {statement.sessions.length === 0 ? (
            <p className="mt-3 text-sm text-[#667085]">No sessions were completed in {statement.period}.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2.5">
              {statement.sessions.map((session) => (
                <li key={session.id} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[#667085]">
                    <span className="font-medium text-[#101828]">{session.sessionTitle}</span> with{" "}
                    {session.menteeName}
                  </span>
                  <span className="text-base text-[#101828]">{formatNaira(session.netAmount)}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : isError ? (
        <DrawerLoadError message="We couldn't load this statement." isRetrying={isFetching} onRetry={() => refetch()} />
      ) : (
        <DrawerSkeleton label="Loading statement" />
      )}
    </EarningsDrawer>
  );
}
