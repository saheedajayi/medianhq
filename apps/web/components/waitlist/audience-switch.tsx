"use client";

import { useState } from "react";
import { motion } from "framer-motion";

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

  return (
    <div
      className="relative mt-20 grid w-[min(100%,194px)] grid-cols-2 overflow-hidden rounded-xl border border-primary bg-accent-50 p-1"
      role="radiogroup"
      aria-label="Choose waitlist audience"
    >
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
            {isActive ? (
              <motion.span
                layoutId="waitlist-audience-thumb"
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-lg bg-primary shadow-sm"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
