import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { TERMS_AND_CONDITIONS } from "@/components/legal/legal-data";

export const metadata: Metadata = {
  title: "Terms & Conditions | Median",
  description:
    "Read the terms and conditions governing the use of Median's mentorship platform.",
};

export default function TermsPage() {
  return <LegalPageLayout document={TERMS_AND_CONDITIONS} />;
}
