import type { ReactNode } from "react";
import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";
import { cn } from "@/lib/utils";
import { cardClass } from "./shared";

type CellKind = "checkbox" | "person" | "lines" | "chip" | "button" | "text";

// Varied but repeatable widths, so rows look like real data rather than identical bars
const TEXT_WIDTHS = ["w-16", "w-24", "w-20", "w-28", "w-14"];
const widthFor = (row: number, column: number) => TEXT_WIDTHS[(row + column * 2) % TEXT_WIDTHS.length];

/** Guesses what a column holds from its header, so a table only has to pass its headers */
export function skeletonCellFor(header: string): CellKind {
  const name = header.toLowerCase();
  if (/^actions?$/.test(name)) return "button";
  if (/(user|mentor|mentee|applicant|sender|receiver|reviewer)/.test(name)) return "person";
  if (/(status|type|consent|role|age|action)/.test(name)) return "chip";
  if (/(date|time|preview|content|submitted|request|reason|recording)/.test(name)) return "lines";
  return "text";
}

function SkeletonCell({ kind, row, column }: { kind: CellKind; row: number; column: number }) {
  switch (kind) {
    case "checkbox":
      return <Skeleton className="size-4 rounded" />;
    case "person":
      return (
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className={cn("h-3.5", row % 2 ? "w-24" : "w-28")} />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      );
    case "lines":
      return (
        <div className="flex flex-col gap-1.5">
          <Skeleton className={cn("h-3.5", widthFor(row, column))} />
          <Skeleton className="h-3 w-14" />
        </div>
      );
    case "chip":
      return <Skeleton className={cn("h-6 rounded-full", row % 3 ? "w-16" : "w-20")} />;
    case "button":
      return <Skeleton className="h-8 w-16 rounded-lg" />;
    default:
      return <Skeleton className={cn("h-3.5", widthFor(row, column))} />;
  }
}

interface TableSkeletonRowsProps {
  /** The table's column headers; each becomes a cell shaped like what it holds */
  headers: string[];
  /** Adds a checkbox cell before the headers */
  withCheckbox?: boolean;
  /** Adds an actions cell after the headers, for tables whose actions column has no header */
  withActions?: boolean;
  rows?: number;
  cellClassName?: string;
}

/** Placeholder rows that keep the table's columns, so the page doesn't jump when data arrives */
export function TableSkeletonRows({
  headers,
  withCheckbox = false,
  withActions = false,
  rows = 6,
  cellClassName = "px-4 py-4",
}: TableSkeletonRowsProps) {
  const kinds: CellKind[] = [
    ...(withCheckbox ? (["checkbox"] as const) : []),
    ...headers.map(skeletonCellFor),
    ...(withActions ? (["button"] as const) : []),
  ];

  return (
    <>
      {Array.from({ length: rows }).map((_, row) => (
        <tr key={row} aria-hidden="true" className="border-b border-[#EAECF0] last:border-0">
          {kinds.map((kind, column) => (
            <td key={column} className={cellClassName}>
              <SkeletonCell kind={kind} row={row} column={column} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** A row of stat cards: a label, a big number and a note */
export function StatCardsSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={cn(cardClass, "flex flex-col gap-3 p-5")}>
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

/** A card with a title, a legend and a chart area of bars */
export function ChartCardSkeleton({ height = 280, className }: { height?: number; className?: string }) {
  const bars = [55, 70, 45, 80, 60, 90, 50, 75, 65, 85, 40, 70];
  return (
    <div className={cn(cardClass, "p-6", className)}>
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <div className="mt-6 flex items-end gap-3" style={{ height }}>
        {bars.map((percent, index) => (
          <Skeleton key={index} className="flex-1 rounded-t-md rounded-b-none" style={{ height: `${percent}%` }} />
        ))}
      </div>
    </div>
  );
}

/** A card with a title and a few lines of details */
export function DetailCardSkeleton({ lines = 4, withAvatar = false }: { lines?: number; withAvatar?: boolean }) {
  return (
    <div className={cn(cardClass, "flex flex-col gap-4 p-6")}>
      {withAvatar ? (
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 shrink-0 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        </div>
      ) : (
        <Skeleton className="h-5 w-36" />
      )}
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className={cn("h-3.5", TEXT_WIDTHS[index % TEXT_WIDTHS.length])} />
        </div>
      ))}
    </div>
  );
}

/** A titled card holding a table, for sections whose whole card is still loading */
export function TableCardSkeleton({ headers, rows = 5 }: { headers: string[]; rows?: number }) {
  return (
    <div className={cn(cardClass, "overflow-hidden")}>
      <div className="flex items-center justify-between gap-4 p-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-9 w-48 rounded-lg" />
      </div>
      <table className="w-full">
        <tbody>
          <TableSkeletonRows headers={headers} rows={rows} />
        </tbody>
      </table>
    </div>
  );
}

/** Groups a loading layout so screen readers hear it once */
export function AdminSkeleton({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <SkeletonGroup label={label} className={cn("flex flex-col gap-6", className)}>
      {children}
    </SkeletonGroup>
  );
}
