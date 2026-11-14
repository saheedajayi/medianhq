import { toast } from "sonner";
import { formatCount } from "../shared/format";

export const financeCardClass = "rounded-2xl border border-[#EAECF0] bg-white";
export const financeHeadingClass = "text-2xl font-semibold text-[#475467]";
export const financeHeadClass = "px-6 py-5 text-left text-base font-semibold text-[#475467]";
export const financeCellClass = "px-6 py-4 align-middle text-[#475467]";
export const financeChipClass = "inline-block whitespace-nowrap rounded px-1.5 py-0.5";
export const exportButtonClass =
  "inline-flex items-center gap-2 rounded bg-[#FF5514] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#E84D12] disabled:opacity-60";

/** "+12% vs previous 7 days", or a plain note when there is no earlier figure to compare with */
export const formatChange = (changePct: number | null) =>
  changePct === null ? "No earlier data to compare" : `${changePct > 0 ? "+" : ""}${changePct}% vs previous 7 days`;

/** A share as a whole percentage */
export const percentOf = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0);

export const formatAmount = formatCount;

/** Money actions are shown as designed but not connected, so nothing is paid or refunded by accident */
export const notifyNotConnected = (action: string) => toast.info(`${action} isn't connected yet.`);
