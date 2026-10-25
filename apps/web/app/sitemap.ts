import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site-config";

type SitemapEntry = MetadataRoute.Sitemap[number];

const PUBLIC_PAGES: {
  path: string;
  changeFrequency: SitemapEntry["changeFrequency"];
  priority: number;
}[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/waitlist", changeFrequency: "weekly", priority: 0.9 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.8 },
  { path: "/signup", changeFrequency: "yearly", priority: 0.6 },
  { path: "/signin", changeFrequency: "yearly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.map(({ path, changeFrequency, priority }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
