"use client";

import { useState } from "react";

import { Button } from "@/components/ui/base/button";
import { cn } from "@/lib/utils";

type Audience = "mentees" | "mentors";

const options: Array<{ label: string; value: Audience }> = [
  { label: "Mentees", value: "mentees" },
  { label: "Mentors", value: "mentors" },
];

export function AudienceSwitch({
  value,
  onValueChange,
}: {
  value?: Audience;
  onValueChange?: (value: Audience) => void;
}) {
  const [internalSelected, setInternalSelected] = useState<Audience>("mentors");
  const selected = value ?? internalSelected;
  const activeIndex = options.findIndex((option) => option.value === selected);

  return (
    <div
      className="relative mt-20 grid w-[min(100%,194px)] grid-cols-2 overflow-hidden rounded-xl border border-primary bg-accent-50 p-1"
      role="radiogroup"
      aria-label="Choose waitlist audience"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-primary shadow-sm transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {options.map((option) => {
        const isActive = selected === option.value;

        return (
          <Button
            key={option.value}
            type="button"
            variant="ghost"
            role="radio"
            aria-checked={isActive}
            onClick={() => {
              setInternalSelected(option.value);
              onValueChange?.(option.value);
            }}
            className={cn(
              "relative z-10 h-11 rounded-lg bg-transparent px-5 text-sm font-semibold transition-colors duration-300 hover:bg-transparent focus-visible:ring-primary/30",
              isActive ? "text-white" : "text-text-700"
            )}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
