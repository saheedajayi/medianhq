"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedTabItem<T extends string = string> {
  value: T;
  label: React.ReactNode;
  count?: number | string;
  disabled?: boolean;
}

export interface SegmentedTabsProps<T extends string = string> {
  tabs: readonly (SegmentedTabItem<T> | T)[];
  activeTab: T;
  onChange: (value: T) => void;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  inactiveTabClassName?: string;
}

const sizeConfig = {
  sm: {
    container: "h-8 p-0.5",
    tab: "px-3 py-1 text-xs",
  },
  md: {
    container: "h-9 p-1",
    tab: "px-4 py-1.5 text-xs",
  },
  lg: {
    container: "h-11 p-1.5",
    tab: "px-5 py-2 text-sm",
  },
};

export function SegmentedTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  size = "md",
  fullWidth = false,
  className,
  tabClassName,
  activeTabClassName,
  inactiveTabClassName,
}: SegmentedTabsProps<T>) {
  const currentSize = sizeConfig[size] || sizeConfig.md;

  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-[#EAECF0]/80 bg-[#F7F8FB]",
        currentSize.container,
        fullWidth && "w-full flex",
        className
      )}
    >
      {tabs.map((tab) => {
        const item: SegmentedTabItem<T> =
          typeof tab === "string" ? { value: tab as T, label: tab } : tab;

        const isActive = activeTab === item.value;

        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={isActive}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={cn(
              "rounded-full font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40",
              currentSize.tab,
              fullWidth && "flex-1 text-center justify-center",
              isActive
                ? cn("bg-white font-semibold text-[#FF5500] shadow-2xs", activeTabClassName)
                : cn("text-[#475467] hover:text-[#101828]", inactiveTabClassName),
              tabClassName
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    isActive
                      ? "bg-[#FFF0EB] text-[#FF5500]"
                      : "bg-[#EAECF0] text-[#667085]"
                  )}
                >
                  {item.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
