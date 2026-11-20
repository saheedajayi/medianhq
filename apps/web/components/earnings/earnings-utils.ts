import type { EarningStatus, PayoutStatus, SessionEarningDetails } from "@/services/earnings";

const LAGOS = "Africa/Lagos";
const HOUR_MS = 60 * 60 * 1000;

export const formatNaira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

/** "June 8, 2026", in Lagos time */
export const formatFullDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { timeZone: LAGOS, month: "long", day: "numeric", year: "numeric" });

/** "January 2023", in Lagos time */
export const formatMonth = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { timeZone: LAGOS, month: "short", year: "numeric" });

/** Only the last four digits ever reach the browser */
export const maskAccount = (lastFour: string) => `•••• •••• ${lastFour}`;

/** "Clears in 24 h", counting up to the next whole hour */
export const formatClearsIn = (iso: string) =>
  `Clears in ${Math.max(Math.ceil((new Date(iso).getTime() - Date.now()) / HOUR_MS), 1)} h`;

export const EARNING_STATUS: Record<EarningStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-[#FFFAEB] text-[#B54708]" },
  PAID_OUT: { label: "Paid out", className: "bg-[#ECFDF3] text-[#067647]" },
  DISPUTED: { label: "Disputed", className: "bg-[#F2F4F7] text-[#344054]" },
  REFUNDED: { label: "Refunded", className: "bg-[#FEF3F2] text-[#B42318]" },
};

export const PAYOUT_STATUS: Record<PayoutStatus, { label: string; className: string }> = {
  PROCESSING: { label: "Processing", className: "bg-[#FFFAEB] text-[#B54708]" },
  COMPLETED: { label: "Completed", className: "bg-[#ECFDF3] text-[#067647]" },
  FAILED: { label: "Failed", className: "bg-[#FEF3F2] text-[#B42318]" },
};

/** What the Net Earned column shows: nothing while disputed, and a deduction once refunded */
export function formatNetEarned(status: EarningStatus, netAmount: number) {
  if (status === "DISPUTED") return "-";
  if (status === "REFUNDED") return `-${formatNaira(netAmount)}`;
  return formatNaira(netAmount);
}

/** The line under a pending earning's status: where it is on the way to being paid */
export function pendingNote(earning: SessionEarningDetails) {
  const completed = `This session was completed on ${formatFullDate(earning.completedAt)}.`;
  if (!earning.hasCleared) {
    return `${completed} Earnings clear 48 hours after completion, expected by ${formatFullDate(earning.clearsAt)}.`;
  }
  if (earning.payoutRequestedAt) {
    return `${completed} Its earnings are part of the payout you requested on ${formatFullDate(earning.payoutRequestedAt)}.`;
  }
  return `${completed} Its earnings have cleared and are available to withdraw.`;
}

export const chipClass = "inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium";
export const cardClass = "overflow-hidden rounded-2xl border border-[#EAECF0] bg-white";
export const cardTitleClass = "text-lg font-medium text-[#101828]";
export const tableHeadClass = "bg-[#F7F8FB] px-4 py-3.5 text-left text-xs font-semibold text-[#475467]";
export const tableCellClass = "border-t border-[#F2F4F7] px-4 py-4 align-middle";
// The app's global anchor rule inherits colour, so link colours need to be forced
export const viewLinkClass = "text-sm font-medium text-[#FF5514]! hover:underline";

const pillClass =
  "inline-flex h-12 items-center justify-center rounded-full px-5 text-base font-medium transition-colors disabled:cursor-not-allowed";
export const primaryButtonClass = `${pillClass} bg-[#FF5514] text-white! hover:bg-[#E84D12] disabled:bg-[#F2F4F7] disabled:text-[#98A2B3]!`;
export const outlineButtonClass = `${pillClass} border border-[#D0D5DD] bg-white text-[#101828]! hover:bg-[#F9FAFB]`;
/** On the dark balance and account cards */
export const onDarkButtonClass = `${pillClass} border border-white text-white! hover:bg-white/10 disabled:border-transparent disabled:bg-[#F2F4F7] disabled:text-[#98A2B3]!`;
