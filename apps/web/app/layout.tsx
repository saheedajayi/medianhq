import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.medianhq.co",
  ),
  title: {
    default: "Median | Vetted Mentorship for African Professionals",
    template: "%s | Median",
  },
  description:
    "Median connects ambitious African professionals with vetted mentors for focused 1-on-1 sessions, group calls, and practical career guidance.",
  applicationName: "Median",
  keywords: [
    "Median",
    "mentorship",
    "African professionals",
    "career mentorship",
    "business mentors",
    "technology mentors",
    "finance mentors",
    "consulting mentors",
  ],
  authors: [{ name: "MedianHQ" }],
  creator: "MedianHQ",
  publisher: "MedianHQ",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Median",
    title: "Median | Vetted Mentorship for African Professionals",
    description:
      "Meet vetted mentors for real advice, structured sessions, and career guidance built for ambitious African professionals.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Median - Vetted mentorship for African professionals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Median | Vetted Mentorship for African Professionals",
    description:
      "Meet vetted mentors for real advice, structured sessions, and career guidance built for ambitious African professionals.",
    images: ["/twitter-image"],
  },
  icons: {
    icon: [
      { url: "/favicon_io/favicon.ico" },
      {
        url: "/favicon_io/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon_io/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/favicon_io/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
