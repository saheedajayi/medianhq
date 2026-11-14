import { More } from "iconsax-react";
import { Skeleton } from "@/components/ui/base/skeleton";
import type { ContentFlag } from "@/services/admin/moderation";
import { cn } from "@/lib/utils";
import { checkboxClass } from "../shared/shared";
import type { FlagColumn } from "./flag-columns";
import { moderationCellClass, moderationHeadClass } from "./moderation-utils";

const SKELETON_ROWS = 8;

interface FlagsTableProps {
  columns: FlagColumn[];
  /** Undefined while the first page loads */
  flags?: ContentFlag[];
  isRefreshing: boolean;
  /** The flag open in the details panel */
  selectedId: string | null;
  onSelect: (flagId: string | null) => void;
}

export function FlagsTable({ columns, flags, isRefreshing, selectedId, onSelect }: FlagsTableProps) {
  // The checkbox column, the named ones, then the actions menu
  const columnCount = columns.length + 2;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse">
        <thead className="bg-[#F2F4F7]">
          <tr>
            <th className="w-12 py-5 pl-5 text-left">
              <input
                type="checkbox"
                aria-label="Clear the selected content"
                checked={selectedId !== null}
                onChange={() => onSelect(null)}
                className={checkboxClass}
              />
            </th>
            {columns.map((column) => (
              <th key={column.header} scope="col" className={moderationHeadClass}>
                {column.header}
              </th>
            ))}
            <th scope="col" className={moderationHeadClass}>
              Actions
            </th>
          </tr>
        </thead>

        <tbody className={cn(isRefreshing && "opacity-60")}>
          {!flags &&
            Array.from({ length: SKELETON_ROWS }).map((_, index) => (
              <tr key={index}>
                <td colSpan={columnCount} className="px-5 py-3">
                  <Skeleton className="h-10 w-full" />
                </td>
              </tr>
            ))}

          {flags?.length === 0 && (
            <tr>
              <td colSpan={columnCount} className={cn(moderationCellClass, "py-16 text-center text-sm")}>
                No flagged content matches these filters.
              </td>
            </tr>
          )}

          {flags?.map((flag) => {
            const isSelected = flag.id === selectedId;
            return (
              <tr key={flag.id}>
                <td className="py-4 pl-5 align-middle">
                  <input
                    type="checkbox"
                    aria-label={`Review content from ${flag.author.name}`}
                    checked={isSelected}
                    onChange={() => onSelect(isSelected ? null : flag.id)}
                    className={checkboxClass}
                  />
                </td>
                {columns.map((column) => (
                  <td key={column.header} className={moderationCellClass}>
                    {column.render(flag)}
                  </td>
                ))}
                <td className={moderationCellClass}>
                  <button
                    type="button"
                    onClick={() => onSelect(flag.id)}
                    className="flex size-8 items-center justify-center rounded-full hover:bg-[#F2F4F7]"
                  >
                    <More size="18" variant="Outline" color="#475467" className="rotate-90" />
                    <span className="sr-only">Open details</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
