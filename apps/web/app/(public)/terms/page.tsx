import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/page-metadata";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { TERMS_AND_CONDITIONS } from "@/components/legal/legal-data";

export const metadata: Metadata = createPageMetadata({
  title: "Terms & Conditions",
  description:
    "Read the terms and conditions governing the use of Median's mentorship platform.",
  path: "/terms",
});

export default function TermsPage() {
  return <LegalPageLayout document={TERMS_AND_CONDITIONS} />;
}
