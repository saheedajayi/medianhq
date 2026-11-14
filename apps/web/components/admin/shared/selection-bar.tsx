import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { textButtonClass } from "./shared";

interface SelectionBarProps {
  /** "2 users selected" */
  label: string;
  onClear: () => void;
  /** What can be done with the selection, shown before Clear */
  children: ReactNode;
  className?: string;
}

/** Appears above a table once rows are ticked */
export function SelectionBar({ label, onClear, children, className }: SelectionBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3", className)}>
      <span className="text-sm font-semibold text-[#101828]">{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        {children}
        <button type="button" onClick={onClear} className={textButtonClass}>
          Clear
        </button>
      </div>
    </div>
  );
}
