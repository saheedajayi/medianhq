import type { ReactNode } from "react";
import { Label } from "@/components/ui/base/label";

export const formInputClassName =
  "h-12 border-text-200 bg-white px-4 text-text-900 placeholder:text-text-400 focus-visible:border-primary focus-visible:ring-primary/15";

export function FormField({
  id,
  label,
  children,
  action,
  compact = true,
}: {
  id: string;
  label: string;
  children: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={id}
          className={
            compact
              ? "text-sm font-normal text-[#141c2e]"
              : "text-base font-semibold text-text-700"
          }
        >
          {label}
        </Label>
      </div>
      {children}
      {action && <div className="text-right">{action}</div>}
    </div>
  );
}
