import type { Metadata } from "next";
import { Suspense } from "react";
import { LandingUnsubscribePage } from "@/components/landing-page/unsubscribe";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return (
    <Suspense>
      <LandingUnsubscribePage />
    </Suspense>
  );
}
