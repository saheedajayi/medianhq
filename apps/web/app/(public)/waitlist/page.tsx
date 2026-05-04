import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Image from "next/image";
import { ArrowRight, X } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/base/accordion";
import { Card, CardContent } from "@/components/ui/base/card";
import { ScrollToWaitlistButton } from "./scroll-to-waitlist-button";
import { WaitlistForm } from "./waitlist-form";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Join the Median Waitlist",
    description:
      "Get early access to Median, the mentorship platform connecting ambitious professionals with vetted mentors.",
  },
};

const featureCards = [
  {
    icon: "👥",
    title: "Group Calls",
    description:
      "Learn alongside peers in small, curated group sessions led by experienced mentors.",
  },
  {
    icon: "🤝",
    title: "One-on-One Sessions",
    description:
      "Deep, focused conversations with a mentor dedicated entirely to your goals.",
  },
  {
    icon: "✅",
    title: "Vetted mentors, only",
    description:
      "Every mentor on Median is reviewed for experience, expertise, and credibility.",
  },
  {
    icon: "💡",
    title: "Become a thought leader",
    description:
      "Your verified profile and session activity establish you as a trusted voice in your field.",
  },
  {
    icon: "🙌",
    title: "Opportunity to give back",
    description:
      "Help the next generation of professionals navigate their careers with clarity.",
  },
  {
    icon: "💸",
    title: "Earning potential",
    description:
      "Your expertise is valuable. Median helps you monetise it with zero friction.",
  },
];

const industries = ["Finance", "Technology", "Business", "Consulting"];

const faqs = [
  {
    question: "Is Median free to use?",
    answer:
      "Joining the waitlist is free. We will share pricing and launch access details before public release.",
  },
  {
    question: "What's the difference between 1-on-1 sessions and group calls?",
    answer:
      "1-on-1 sessions are private conversations between you and your chosen mentor, fully tailored to your personal goals and situation. Group calls are small, curated sessions where a mentor guides multiple mentees at once around a shared theme or challenge. Both are structured and outcome-focused; it just depends on what you need.",
  },
  {
    question: "How are mentors vetted?",
    answer:
      "Every mentor applies to join the platform. Our team reviews each application based on professional experience, industry credibility, and their ability to guide others. Only approved mentors appear on the platform, no self-serve onboarding.",
  },
  {
    question: "What industries does Median cover?",
    answer:
      "We're starting with a focused set of industries to ensure quality, including finance, technology, consulting, and creative fields. We'll expand based on demand from our early community. If you're in a niche industry, join the waitlist and let us know.",
  },
  {
    question: "How does the application process work for mentor?",
    answer:
      "You submit an application with your professional background, industry, and areas of expertise. Our team reviews it manually, we look for credibility, experience, and genuine willingness to guide others. You'll hear back within 5 business days.",
  },
  {
    question: "How do mentors earn on Median?",
    answer:
      "You set your own session rates for 1-on-1 bookings and group calls. Median takes a small platform commission, we'll be fully transparent about the split before you go live. You keep the majority of what you earn.",
  },
  {
    question: "Can mentors choose how much time to commit?",
    answer:
      "Completely. You control your calendar and availability. Accept as many or as few bookings as fits your schedule. There's no minimum commitment, Median works around your life, not the other way around.",
  },
  {
    question: "When will Median launch?",
    answer:
      "We're actively building and testing. Waitlist members will get early access before the public launch, along with updates on our progress. You'll be the first to know, and the first to benefit.",
  },
];

const defaultFaq = faqs[0]?.question;

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Image
      src="/median-logo.svg"
      alt="Median"
      width={220}
      height={40}
      priority
      className={
        inverse
          ? "h-10 w-[220px] brightness-0 invert"
          : "h-10 w-[220px]"
      }
    />
  );
}

export default function WaitlistPage() {
  return (
    <main className={`${poppins.className} min-h-svh bg-[#fcfcfd] text-text-900`}>
      <header
        className="flex h-[100px] w-full items-center justify-between px-5 sm:px-8 lg:px-[100px]"
      >
        <Logo />
        <ScrollToWaitlistButton className="hidden h-12 px-5 text-sm font-semibold text-white sm:inline-flex">
          Join waitlist
        </ScrollToWaitlistButton>
      </header>

      <section
        className="flex w-full flex-col items-center px-5 pb-24 pt-16 text-center sm:px-8 sm:pt-24"
        style={{ width: "100%", maxWidth: "1040px", marginInline: "auto" }}
      >
        <h1
          className="font-neco w-full max-w-full text-[36px] leading-[1.04] font-black tracking-normal text-text-900 sm:text-7xl lg:text-[88px]"
          style={{ maxWidth: "calc(100vw - 40px)", overflowWrap: "break-word" }}
        >
          Meet the mentor <span className="block sm:inline">who</span>{" "}
          <span className="block text-primary">changes everything.</span>
        </h1>
        <p
          className="mt-8 text-lg leading-8 font-semibold text-text-700 sm:text-xl"
          style={{ maxWidth: "min(520px, calc(100vw - 40px))" }}
        >
          Vetted experts. Real advice. Free to start. The mentorship platform
          built for ambitious African professionals.
        </p>

        <div
          className="mt-8 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-accent-150 bg-[#fffaf5] px-4 py-3 text-center text-xs font-semibold text-text-900 sm:gap-3 sm:px-6 sm:text-sm"
          style={{ maxWidth: "calc(100vw - 40px)" }}
        >
          <span className="size-2.5 rounded-full bg-primary" />
          <span className="font-bold text-primary">2000</span>
          <span>Professionals already on the waitlist</span>
        </div>

        <WaitlistForm />
      </section>

      <section
        className="w-full px-5 py-16 sm:px-8"
        style={{ width: "100%", maxWidth: "1200px", marginInline: "auto" }}
      >
        <div className="mx-auto max-w-[460px] text-center">
          <h2 className="font-serif text-4xl font-black text-primary">
            What we&apos;re building
          </h2>
          <p className="mt-4 text-sm leading-6 font-semibold text-text-700">
            We built Median to fix the broken, informal, hit-or-miss way
            mentorship works today. Here&apos;s what makes it different.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((card) => (
            <Card
              key={card.title}
              className="border-text-100 bg-white"
            >
              <CardContent className="p-6">
                <div className="mb-6 inline-flex size-8 items-center justify-center rounded-md bg-accent-50 text-lg">
                  <span aria-hidden="true">{card.icon}</span>
                </div>
                <h3 className="text-base font-bold text-text-800">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-text-600">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section
        className="w-full px-5 py-16 text-center sm:px-8"
        style={{ width: "100%", maxWidth: "760px", marginInline: "auto" }}
      >
        <h2 className="font-serif text-4xl font-black text-primary">
          For professionals in
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-9 gap-y-4 text-base font-bold">
          {industries.map((industry, index) => (
            <span
              key={industry}
              className={
                industry === "Technology" || industry === "Consulting"
                  ? "text-primary"
                  : "text-[#4e0703]"
              }
            >
              {industry}
              {index < industries.length - 1 ? (
                <span className="ml-9 text-2xl text-accent-150">•</span>
              ) : null}
            </span>
          ))}
        </div>
      </section>

      <section
        className="w-full px-5 py-16 sm:px-8"
        style={{ width: "100%", maxWidth: "840px", marginInline: "auto" }}
      >
        <h2 className="text-center font-serif text-4xl font-black text-primary">
          A note from the founder
        </h2>
        <div className="mt-10 text-lg leading-7 font-semibold text-text-900">
          <div className="absolute translate-y-14 -translate-x-6 text-[12rem] text-accent-150">
            <span>❛</span>
            <span>❛</span>
          </div>
          <p className="relative z-10">
            Early in my career, finding someone to guide me felt almost
            impossible. I spent months scouring LinkedIn, writing cold emails
            into the void, waiting weeks, sometimes months, for a reply that
            often never came. It was exhausting, and honestly, discouraging.
          </p>
          <p className="mt-6">
            But eventually, things changed. As I grew in my career, I made a
            decision: I would try to give others what I never had. I started
            showing up for people; offering clarity, direction, a listening ear.
            And I quickly realised I wasn&apos;t alone in that instinct. There were
            so many experienced professionals who genuinely wanted to help, but
            had no structured way to do it.
          </p>
          <p className="mt-6">
            That&apos;s why I built Median. Not just a platform, but an intersection.
            A place where ambition meets guidance, where experience meets
            opportunity, and where mentorship becomes something real,
            structured, and accessible to everyone who needs it.
          </p>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            AM
          </div>
          <div>
            <p className="text-sm font-bold text-text-900">Abdullah Mumuni</p>
            <p className="text-xs text-text-500">Founder, Median</p>
          </div>
        </div>
      </section>

      <section
        className="w-full px-5 py-16 sm:px-8"
        style={{ width: "100%", maxWidth: "820px", marginInline: "auto" }}
      >
        <h2 className="text-center font-serif text-4xl font-black text-primary">
          Frequently asked questions
        </h2>
        <Accordion
          type="single"
          collapsible
          defaultValue={defaultFaq}
          className="mt-12"
        >
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.question}
              value={faq.question}
              className="border-accent-150 py-2"
            >
              <AccordionTrigger className="text-base font-bold text-text-900 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="max-w-[820px] text-base leading-6 text-text-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="bg-[#6d0904] px-5 py-24 text-center text-white sm:px-8">
        <h2 className="mx-auto max-w-[600px] font-serif text-5xl leading-tight font-black sm:text-6xl">
          Your network is <span className="text-primary">not</span> your limit.
        </h2>
        <p className="mx-auto mt-6 max-w-[340px] text-base leading-6 text-white/85">
          Join thousands of professionals building the careers they actually
          want.
        </p>
        <ScrollToWaitlistButton className="mt-8 h-12 gap-3 px-8 text-sm font-bold text-white">
          Join the waitlist, it&apos;s free
          <ArrowRight className="size-4" />
        </ScrollToWaitlistButton>
      </section>

      <footer className="flex flex-col gap-8 bg-[#6d0904] px-5 pb-8 text-white sm:px-8">
        <div
          className="flex w-full flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 sm:flex-row"
          style={{ width: "100%", maxWidth: "1320px", marginInline: "auto" }}
        >
          <Logo inverse />
          <p className="text-xs text-white/45">
            © 2026 MedianHQ. All rights reserved
          </p>
          <div className="flex items-center gap-5 text-white/80">
            <a
              href="#"
              aria-label="LinkedIn"
              className="text-sm font-bold hover:text-white"
            >
              in
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="text-sm font-bold hover:text-white"
            >
              ig
            </a>
            <a href="#" aria-label="X" className="hover:text-white">
              <X className="size-5" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
