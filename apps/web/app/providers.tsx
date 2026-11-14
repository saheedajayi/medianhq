"use client";

import type { ReactNode } from "react";

import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { Toaster } from "@/components/ui/base/sonner";
import { QueryProvider } from "@/providers/query-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster />
      <PageViewTracker />
    </QueryProvider>
  );
}
