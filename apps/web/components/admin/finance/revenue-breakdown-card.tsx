"use client";

import { useState } from "react";
import type { RevenueBucket } from "@/services/admin/finance";
import { cn } from "@/lib/utils";
import { textButtonClass } from "../shared/shared";
import { financeCardClass, formatAmount } from "./finance-utils";

const headClass = "px-8 py-3 text-left text-xs font-semibold text-[#475467]";
const cellClass = "px-8 py-2.5 text-sm text-[#475467]";

interface RevenueBreakdownCardProps {
  /** The most recent periods, shown until "view all" is pressed */
  breakdown: RevenueBucket[];
  /** Every period on the chart */
  series: RevenueBucket[];
  showSubscriptions: boolean;
}

export function RevenueBreakdownCard({ breakdown, series, showSubscriptions }: RevenueBreakdownCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const rows = isExpanded ? series : breakdown;

  return (
    <section className={cn(financeCardClass, "overflow-hidden")}>
      <div className="flex items-center justify-between gap-3 px-3 py-4">
        <h2 className="text-xl font-semibold text-[#475467]">Revenue Breakdown</h2>
        {series.length > breakdown.length && (
          <button type="button" onClick={() => setIsExpanded(!isExpanded)} className={cn(textButtonClass, "px-4 text-lg")}>
            {isExpanded ? "view less" : "view all"}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse">
          <thead className="bg-[#F2F4F7]">
            <tr>
              <th scope="col" className={headClass}>
                Date
              </th>
              <th scope="col" className={headClass}>
                {showSubscriptions ? "Subscription Revenue" : "Session Revenue"}
              </th>
              <th scope="col" className={headClass}>
                Total Revenue
              </th>
              <th scope="col" className={headClass}>
                Growth
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((bucket) => (
              <tr key={bucket.label}>
                <td className={cellClass}>{bucket.label}</td>
                <td className={cellClass}>
                  {formatAmount(showSubscriptions ? bucket.subscriptionRevenue : bucket.sessionRevenue)}
                </td>
                <td className={cellClass}>{formatAmount(bucket.totalRevenue)}</td>
                <td
                  className={cn(
                    cellClass,
                    bucket.growthPct !== null && (bucket.growthPct < 0 ? "text-[#D92D20]" : "text-[#12B76A]"),
                  )}
                >
                  {/* A dash where the period before had no revenue to grow from */}
                  {bucket.growthPct === null ? "—" : `${bucket.growthPct}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
