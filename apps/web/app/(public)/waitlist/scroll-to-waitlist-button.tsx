"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/base/button";

export function ScrollToWaitlistButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Button
      type="button"
      className={className}
      onClick={() => {
        document
          .getElementById("waitlist-form")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }}
    >
      {children}
    </Button>
  );
}
