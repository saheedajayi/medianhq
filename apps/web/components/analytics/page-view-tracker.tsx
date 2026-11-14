"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { analyticsService } from "@/services/analytics";

// Admin pages are staff, not visitors
const UNTRACKED_PREFIXES = ["/admin"];

/** Reports each page someone opens, for the visitors chart on the admin analytics page */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || UNTRACKED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return;
    analyticsService.track({ type: "PAGE_VIEW", path: pathname });
  }, [pathname]);

  return null;
}
