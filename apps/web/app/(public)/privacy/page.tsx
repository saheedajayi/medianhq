import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/page-metadata";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { PRIVACY_NOTICE } from "@/components/legal/legal-data";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Notice",
  description:
    "Learn how Median collects, uses, and protects your personal data.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <LegalPageLayout document={PRIVACY_NOTICE} />;
}
