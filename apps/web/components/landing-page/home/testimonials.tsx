"use client";

import { useRef, useState } from "react";

const TESTIMONIALS = [
  {
    quote:
      "Your mission with Median genuinely resonates. The focus on intentional matching, and the deep understanding of what a pivotal conversation can mean at the right time, speaks directly to why I'm passionate about this.",
    author: "Liadi Adeleke",
    role: "Head of IT and Automation at Avon Medical Practice",
    initials: "TK",
  },
  {
    quote:
      "I strongly believe in mentorship and in the importance of supporting people to grow and achieve their aspirations. I believe that sometimes the right guidance and conversation at the right time can make a significant difference in someone's journey.",
    author: "Salfullahi Yau",
    role: "Regional Head at Lotus bank",
    initials: "TK",
  },
  {
    quote:
      "Finding mentors who understand the unique landscape of scaling tech in emerging markets was nearly impossible until Median. It completely transforms career trajectory and provides invaluable guidance.",
    author: "Fola Adeola",
    role: "VP of People Operations at Flutterwave",
    initials: "FA",
  },
  {
    quote:
      "The structured milestone tracking system keeps both mentors and mentees deeply aligned and accountable between calls. You see tangible growth and breakthroughs after every session.",
    author: "Tunde Olanrewaju",
    role: "Senior Engineering Manager at Moniepoint",
    initials: "TO",
  },
];

export function LandingTestimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToCard = (index: number) => {
    if (!scrollRef.current) return;
    const cards = scrollRef.current.children;
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
      setActiveIndex(index);
    }
  };

  const handlePrev = () => {
    const nextIdx = Math.max(0, activeIndex - 1);
    scrollToCard(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = Math.min(TESTIMONIALS.length - 1, activeIndex + 1);
    scrollToCard(nextIdx);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const totalScrollable = scrollWidth - clientWidth;
    if (totalScrollable <= 0) return;
    const progress = scrollLeft / totalScrollable;
    const index = Math.min(
      TESTIMONIALS.length - 1,
      Math.max(0, Math.round(progress * (TESTIMONIALS.length - 1)))
    );
    setActiveIndex(index);
  };

  return (
    <section className="relative overflow-hidden bg-[#4E0703] py-20 sm:py-28 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with Nav Arrows */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-3xl">
            <h2 className="mb-4 text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-white">
              What industry professionals say about median
            </h2>
            {/* 4 Dash Indicators */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToCard(idx)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? "w-8 bg-[#FF5514]"
                      : "w-8 bg-[#713935] hover:bg-white/40"
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
            
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeIndex === 0}
              aria-label="Previous testimonial"
              className="flex size-10 sm:size-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/80 transition-all hover:bg-white/15 hover:text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
            >
              <svg className="size-4 sm:size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={activeIndex === TESTIMONIALS.length - 1}
              aria-label="Next testimonial"
              className="flex size-10 sm:size-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/80 transition-all hover:bg-white/15 hover:text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95"
            >
              <svg className="size-4 sm:size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Testimonials Horizontal Carousel (scrollable with cut-off card peek) */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="mt-10 sm:mt-12 flex gap-5 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mr-4 sm:-mr-6 lg:-mr-8 pr-4 sm:pr-6 lg:pr-8"
        >
          {TESTIMONIALS.map((item) => (
            <div
              key={item.author}
              className="flex w-[82vw] sm:w-[500px] lg:w-[560px] shrink-0 snap-start flex-col justify-between rounded-2xl sm:rounded-3xl border border-[#713935]/60 bg-[#3C0502]/70 p-6 sm:p-8 backdrop-blur-xs transition-all hover:border-[#8C2F0B]"
            >
              <p className="text-base sm:text-lg font-serif italic leading-relaxed text-white/95">
                {item.quote}
              </p>

              <div className="mt-6 sm:mt-8 flex items-center gap-3">
                <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-[#FF5514] text-xs font-bold text-white shadow-xs">
                  {item.initials}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white">{item.author}</h4>
                  <p className="text-[10px] sm:text-xs text-white/60 mt-0.5">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
