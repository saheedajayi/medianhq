import type { Metadata } from "next";

import { siteConfig } from "@/lib/site-config";

type PageMetadataOptions = {
  /** Page title without the site name; the root layout's template appends it */
  title: string;
  description: string;
  /** Path of the page, e.g. "/pricing"; used for the canonical and Open Graph URL */
  path: string;
};

/**
 * Metadata for an indexable page. Next.js replaces `openGraph` and `twitter`
 * wholesale rather than merging them with the root layout's, so the shared
 * fields (site name, image, card type) are repeated here.
 */
export function createPageMetadata({
  title,
  description,
  path,
}: PageMetadataOptions): Metadata {
  const socialTitle = `${title} | ${siteConfig.name}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: path,
      siteName: siteConfig.name,
      title: socialTitle,
      description,
      images: [siteConfig.socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [siteConfig.socialImage],
    },
  };
}

/** For signed-in and account-flow pages that should never appear in search results */
export const noIndexMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
