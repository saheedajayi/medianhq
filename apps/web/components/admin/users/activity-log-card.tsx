"use client";

import { ExportSquare } from "iconsax-react";
import type { AdminUserDetail } from "@/services/admin/users";
import { downloadCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
import { formatMoment } from "../shared/format";
import { cardClass, cardTitleClass, textButtonClass } from "../shared/shared";

interface ActivityLogCardProps {
  userId: string;
  activity: AdminUserDetail["activity"];
}

export function ActivityLogCard({ userId, activity }: ActivityLogCardProps) {
  const handleExport = () =>
    downloadCsv(`median-user-${userId}-log.csv`, [
      ["When", "Event", "Reference", "User ID"],
      ...activity.map((entry) => [entry.at, entry.text, entry.reference, userId]),
    ]);

  return (
    <section className={cn(cardClass, "p-5")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={cardTitleClass}>Activity &amp; audit log</h2>
        <button
          type="button"
          onClick={handleExport}
          disabled={activity.length === 0}
          className={cn(textButtonClass, "inline-flex items-center gap-2")}
        >
          <ExportSquare size="18" variant="Outline" color="#101828" />
          Export log CSV
        </button>
      </div>

      {activity.length === 0 ? (
        <p className="mt-4 text-sm text-[#667085]">No recorded activity.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3 text-sm text-[#344054]">
          {activity.map((entry) => (
            <li key={entry.id}>
              {[formatMoment(entry.at), entry.text, entry.reference, userId].filter(Boolean).join(" · ")}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
