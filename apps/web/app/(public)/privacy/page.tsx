import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { PRIVACY_NOTICE } from "@/components/legal/legal-data";

export const metadata: Metadata = {
  title: "Privacy Notice | Median",
  description:
    "Learn how Median collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return <LegalPageLayout document={PRIVACY_NOTICE} />;
}
