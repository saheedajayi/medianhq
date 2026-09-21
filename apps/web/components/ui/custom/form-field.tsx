import type { ReactNode } from "react";
import { Label } from "@/components/ui/base/label";

export const formInputClassName =
  "h-11 rounded-lg border border-[#D0D5DD] bg-white px-3.5 text-sm text-[#101828] placeholder:text-[#98A2B3] focus-visible:border-[#FF5514] focus-visible:ring-2 focus-visible:ring-[#FF5514]/15 shadow-xs transition-colors";

export function FormField({
  id,
  label,
  children,
  action,
  compact = true,
  error,
}: {
  id: string;
  label: string;
  children: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  error?: string;
}) {
  return (
    <div className="grid gap-1.5 content-start">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={id}
          className={
            compact
              ? "text-sm font-medium text-[#344054]"
              : "text-base font-semibold text-text-700"
          }
        >
          {label}
        </Label>
        {action && <div className="text-right">{action}</div>}
      </div>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
