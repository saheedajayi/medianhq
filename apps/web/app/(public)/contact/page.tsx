import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/page-metadata";
import { LandingContactPage } from "@/components/landing-page/contact";

export const metadata: Metadata = createPageMetadata({
  title: "Contact Us",
  description: "Questions about mentorship, payments or partnerships? Send the Median team a message.",
  path: "/contact",
});

export default function ContactPage() {
  return <LandingContactPage />;
}
