import type { Metadata } from "next";

export const waitlistMetadata: Metadata = {
  title: "Join the Waitlist",
  description:
    "Join Median's waitlist for vetted mentorship, 1-on-1 sessions, group calls, and practical career guidance built for ambitious African professionals.",
  alternates: {
    canonical: "/waitlist",
  },
  openGraph: {
    title: "Join the Median Waitlist",
    description:
      "Get early access to Median, the mentorship platform connecting ambitious professionals with vetted mentors.",
    url: "/waitlist",
    siteName: "Median",
    type: "website",
    images: [
      {
        url: "/social-preview.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Join the Median waitlist",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Join the Median Waitlist",
    description:
      "Get early access to Median, the mentorship platform connecting ambitious professionals with vetted mentors.",
    images: [
      {
        url: "/social-preview.png",
        alt: "Join the Median waitlist",
      },
    ],
  },
};
