import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const sizeClasses = {
  xs: "size-3",
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
  xl: "size-10",
} as const;

export type SpinnerSize = keyof typeof sizeClasses;

export interface SpinnerProps extends ComponentProps<"svg"> {
  size?: SpinnerSize;
}

export function Spinner({ size = "sm", className, ...props }: SpinnerProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn(
        "animate-spin text-[#98A2B3]",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
