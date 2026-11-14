import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SessionStatTileProps {
  label: string;
  value: number;
  note: ReactNode;
  icon: ReactNode;
  /** The red tile that calls out mentors needing attention */
  isAlert?: boolean;
}

export function SessionStatTile({ label, value, note, icon, isAlert = false }: SessionStatTileProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border p-5",
        isAlert ? "border-[#FDA29B] bg-[#FEF3F2]" : "border-[#EAECF0] bg-[#FCFCFD]",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          isAlert ? "bg-[#FEE4E2]" : "bg-[#EAECF0]",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="mt-1.5 text-[15px] text-[#475467]">{label}</p>
        <p className="mt-1 text-4xl font-medium tracking-tight text-[#101828]">{value.toLocaleString("en-NG")}</p>
        <p className="mt-2 text-xs text-[#98A2B3]">{note}</p>
      </div>
    </div>
  );
}
