const defaultSiteUrl = "https://www.medianhq.co";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteConfig = {
  name: "Median",
  title: "Median | Vetted Mentorship for African Professionals",
  description:
    "Median connects ambitious African professionals with vetted mentors for focused 1-on-1 sessions, group calls, and practical career guidance.",
  socialDescription:
    "Meet vetted mentors for real advice, structured sessions, and career guidance built for ambitious African professionals.",
  url: (configuredSiteUrl || defaultSiteUrl).replace(/\/+$/, ""),
  socialImage: {
    url: "/social-preview.png",
    width: 1200,
    height: 630,
    type: "image/png",
    alt: "Median - Vetted mentorship for African professionals",
  },
} as const;
