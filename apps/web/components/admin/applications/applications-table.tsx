import Link from "next/link";
import type { AdminApplicationRow } from "@/services/admin/applications";
import { cn } from "@/lib/utils";
import { formatDay } from "../shared/format";
import { checkboxClass, linkClass, tableCellClass, tableHeadClass } from "../shared/shared";
import { ApplicationAgeBadge } from "./application-age-badge";
import { formatRole, getReviewProgress } from "./application-utils";
import { TableSkeletonRows } from "../shared/skeletons";

const COLUMNS = ["Applicant", "Expertise", "Submitted", "Reviewer / notes", "Age"];
// The checkbox and Review columns sit either side of the named ones
const COLUMN_COUNT = COLUMNS.length + 2;
const SKELETON_ROWS = 6;

interface ApplicationsTableProps {
  /** Undefined while the first page loads */
  applications?: AdminApplicationRow[];
  /** Dims the rows while another page or filter loads */
  isRefreshing: boolean;
  isSelected: (applicationId: string) => boolean;
  isPageSelected: boolean;
  onToggle: (application: AdminApplicationRow) => void;
  onTogglePage: () => void;
}

export function ApplicationsTable({
  applications,
  isRefreshing,
  isSelected,
  isPageSelected,
  onToggle,
  onTogglePage,
}: ApplicationsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead className="bg-[#F9FAFB]">
          <tr>
            <th className="w-12 py-3.5 pl-4 text-left">
              <input
                type="checkbox"
                aria-label="Select all applications on this page"
                checked={isPageSelected}
                onChange={onTogglePage}
                className={checkboxClass}
              />
            </th>
            {COLUMNS.map((column) => (
              <th key={column} scope="col" className={tableHeadClass}>
                {column}
              </th>
            ))}
            <th className="w-20">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody className={cn("divide-y divide-[#EAECF0]", isRefreshing && "opacity-60")}>
          {!applications && (
            <TableSkeletonRows headers={COLUMNS} withCheckbox withActions rows={SKELETON_ROWS} />
          )}

          {applications?.length === 0 && (
            <tr>
              <td colSpan={COLUMN_COUNT} className="px-4 py-16 text-center text-sm text-[#667085]">
                No applications match these filters.
              </td>
            </tr>
          )}

          {applications?.map((application) => (
            <tr key={application.id} className={cn(isSelected(application.id) && "bg-[#FFF9F6]")}>
              <td className="py-4 pl-4 align-middle">
                <input
                  type="checkbox"
                  aria-label={`Select ${application.name}`}
                  checked={isSelected(application.id)}
                  onChange={() => onToggle(application)}
                  className={checkboxClass}
                />
              </td>
              <td className={tableCellClass}>
                <p className="font-semibold text-[#101828]">{application.name}</p>
                <p className="mt-1 text-xs text-[#667085]">{formatRole(application) || application.email}</p>
                <p className="mt-1 text-xs text-[#667085]">{application.id}</p>
              </td>
              <td className={cn(tableCellClass, "text-[#344054]")}>{application.expertise}</td>
              <td className={cn(tableCellClass, "whitespace-nowrap text-xs text-[#667085]")}>
                {formatDay(application.submittedAt)}
              </td>
              <td className={tableCellClass}>
                <p className="text-[#344054]">{application.reviewer?.name ?? "Unassigned"}</p>
                <p className="mt-1 text-xs text-[#667085]">{getReviewProgress(application)}</p>
              </td>
              <td className={tableCellClass}>
                <ApplicationAgeBadge application={application} />
              </td>
              <td className={tableCellClass}>
                <Link href={`/admin/applications/${application.id}`} className={linkClass}>
                  Review
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
