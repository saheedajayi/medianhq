import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site-config";

// Signed-in areas, account flows and internal tools. These pages also send
// noindex, so any URL Google already knows about drops out of results.
const PRIVATE_PATHS = [
  "/api/",
  "/backoffice",
  "/dashboard",
  "/bookings",
  "/explore",
  "/messages",
  "/settings",
  "/mentee/",
  "/mentor/",
  "/mentors/",
  "/email-verification",
  "/mentee-onboarding",
  "/mentor-onboarding",
  "/mentor-matches",
  "/mentor-submitted",
  "/role-selection",
  "/reset-password",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: PRIVATE_PATHS,
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
