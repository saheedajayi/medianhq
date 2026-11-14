import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/page-metadata";
import { LandingCareersPage } from "@/components/landing-page/careers";

export const metadata: Metadata = createPageMetadata({
  title: "Careers",
  description: "Open roles at Median, the vetted mentorship platform for African professionals.",
  path: "/careers",
});

export default function CareersPage() {
  return <LandingCareersPage />;
}
