import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";
import { siteConfig } from "@/lib/site-config";

// Tells Google who runs the site, which helps it show the brand panel and sitelinks
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}/median-logo.png`,
      description: siteConfig.description,
      email: siteConfig.links.email.replace("mailto:", ""),
      sameAs: [siteConfig.links.linkedin, siteConfig.links.twitter, siteConfig.links.instagram],
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      publisher: { "@id": `${siteConfig.url}/#organization` },
    },
  ],
};

// Title and description come from the root layout's defaults
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.socialDescription,
    images: [siteConfig.socialImage],
  },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ audience?: string }>;
}) {
  const { audience } = await searchParams;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LandingPage initialAudience={audience === "mentor" ? "mentor" : "mentee"} />
    </>
  );
}
