"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

const content = [
  {
    id: "mentee",
    title: (
      <>
        Learn from those who
        <br />
        have walked the path.
      </>
    ),
    description:
      "Median connects ambitious builders and future leaders with vetted industry leaders, for real, high-impact 1-on-1 mentorship.",
    benefits: [
      "1-on-1 Personalized Live Sessions",
      "Curated Industry Expert Matchmaking",
      "Flexible, Goal-Oriented Scheduling",
    ],
  },
  {
    id: "mentor",
    title: (
      <>
        Share your expertise
        <br />
        with future leaders.
      </>
    ),
    description:
      "Inspire the next generation of professionals. Shape careers and give back to the community on your own terms.",
    benefits: [
      "Impact-Driven 1-on-1 Mentorship",
      "Set Your Own Availability",
      "Expand Your Professional Network",
    ],
  },
];

export function AnimatedAuthCopy() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % content.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = content[index];
  if (!current) return null;

  return (
    <>
      <div className="relative z-10 mt-20 min-h-[200px] max-w-[450px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-[32px] font-semibold leading-[1.2] tracking-[-0.03em] xl:text-[36px]">
              {current.title}
            </h1>
            <p className="mt-7 max-w-[440px] text-[15px] leading-6 text-[#FFEEE8]">
              {current.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 mt-auto pb-1">
        <AnimatePresence mode="wait">
          <motion.ul
            key={current.id}
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.4 }}
            className="grid gap-4 text-base"
          >
            {current.benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/90 text-primary">
                  <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                </span>
                {benefit}
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>
    </>
  );
}
