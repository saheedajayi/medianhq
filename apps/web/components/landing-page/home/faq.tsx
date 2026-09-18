"use client";

import { useState } from "react";

const FAQS = [
  {
    question: "Is it really free?",
    answer:
      "Yes! Many mentors offer free introductory sessions ('Get to Know You') so you can connect, ask initial questions, and find the perfect match without any upfront commitment before booking deep-dive sessions.",
  },
  {
    question: "How are mentors vetted?",
    answer:
      "Every mentor goes through a multi-step application: AI pre-screening, written application, and human review. We accept fewer than 22% of applicants.",
  },
  {
    question: "When do you launch publicly?",
    answer:
      "Public launch is Month 5. Waitlist members get Closed Beta access in Month 3, well ahead of the public. Your position determines how early you get in.",
  },
  {
    question: "How do sessions work?",
    answer:
      "Sessions are 30 or 60 minutes via native video. You book from your mentor's live calendar, get instant confirmation, and reminders at 24h, 1h, and 10 min before.",
  },
  {
    question: "Can I be both a mentor and a mentee?",
    answer:
      "Absolutely. Many professionals on Median mentor in their area of expertise while seeking guidance in a new domain like fundraising or a career pivot.",
  },
  {
    question: "What if a mentor doesn't show up?",
    answer:
      "You'll receive an automatic credit for any no-show. Mentors with 3 no-shows in 90 days face account review.",
  },
  {
    question: "Is Median only for Nigerian professionals?",
    answer:
      "No — we're global. Our HQ is in Lagos and we're focused on African professionals, but mentors and mentees from all regions are welcome.",
  },
  {
    question: "How does the referral programme work?",
    answer:
      "After signing up, you get a unique link. 3 referrals → top 10% queue · 10 referrals → 1 month Pro free · 25 referrals → Lifetime Pro.",
  },
];

export function LandingFAQ() {
  const [openIndices, setOpenIndices] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <h2 className="text-center text-2xl font-semibold tracking-tight text-[#FF5514] sm:text-3xl lg:text-4xl">
          Frequently asked questions
        </h2>

        {/* Accordion list with #FFD9A8 dividers */}
        <div className="mt-14 divide-y divide-[#FFD9A8] border-b border-[#FFD9A8]">
          {FAQS.map((faq, index) => {
            const isOpen = openIndices.includes(index);
            return (
              <div key={faq.question} className="py-5 sm:py-6">
                <button
                  type="button"
                  onClick={() => toggleIndex(index)}
                  className="flex w-full items-center justify-between text-left transition-colors"
                >
                  <span className="text-[16px] font-medium text-[#101828]">
                    {faq.question}
                  </span>
                  <span
                    className="ml-4 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#4E0703] text-white transition-transform"
                  >
                    {isOpen ? (
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    ) : (
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    )}
                  </span>
                </button>

                {isOpen && (
                  <p className="mt-2.5 text-[14px] font-normal leading-relaxed text-[#475467] pr-10">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
