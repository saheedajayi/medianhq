"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "./onboarding-context";

const MENTEE_STEPS = [
  { id: 1, label: "Select Role" },
  { id: 2, label: "Set Goals" },
  { id: 3, label: "Find Mentor" },
];

const MENTOR_STEPS = [
  { id: 1, label: "Select Role" },
  { id: 2, label: "Set Profile" },
  { id: 3, label: "Share why" },
];

const SIDEBAR_TEXT: Record<string, { title: string; description: string }> = {
  "/role-selection": {
    title: "Choose how you want to connect.",
    description:
      "Whether you're here to learn from industry experts or share your knowledge, Median matches you with the right people.",
  },
  "/mentee-onboarding": {
    title: "Define what success looks like for you.",
    description:
      "Set your goals so we can match you with mentors who have the experience to help you get there.",
  },
  "/mentor-onboarding": {
    title: "Share your professional experience.",
    description:
      "Help us understand your background so we can connect you with the right mentees.",
  },
  "/mentor-onboarding-step2": {
    title: "Share why you want to mentor.",
    description:
      "Help us understand your motivations and experience to match you with the right mentees.",
  },
  "/mentor-matches": {
    title: "Find your mentor match.",
    description:
      "Browse top recommended mentors tailored to your goals and aspirations.",
  },
  "/mentor-submitted": {
    title: "Application submitted.",
    description:
      "We are reviewing your application and will get back to you shortly.",
  },
};

export function OnboardingSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const { role } = useOnboarding();

  let activeStep = 1;
  if (pathname === "/mentee-onboarding") {
    activeStep = 2;
  } else if (pathname === "/mentor-onboarding") {
    activeStep = stepParam === "2" ? 3 : 2;
  } else if (pathname === "/mentor-matches" || pathname === "/mentor-submitted") {
    activeStep = 4;
  }

  const currentRole =
    pathname === "/mentor-onboarding" || pathname === "/mentor-submitted"
      ? "MENTOR"
      : role;

  const steps = currentRole === "MENTOR" ? MENTOR_STEPS : MENTEE_STEPS;
  const copyKey =
    pathname === "/mentor-onboarding" && stepParam === "2"
      ? "/mentor-onboarding-step2"
      : pathname;
  const copy = SIDEBAR_TEXT[copyKey] || SIDEBAR_TEXT["/role-selection"];

  return (
    <div className="relative z-10 mt-14 max-w-[450px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          <h1 className="text-[32px] font-semibold leading-[1.2] tracking-[-0.03em] text-white xl:text-[36px]">
            {copy?.title}
          </h1>
          <p className="mt-4 max-w-[440px] text-[15px] leading-6 text-[#FFEEE8]">
            {copy?.description}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 flex flex-col">
        {steps.map((step, index) => {
          const isCompleted = step.id < activeStep;
          const isActive = step.id === activeStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex flex-col">
              <div className="flex items-center gap-4">
                <div
                  className={`grid size-9 shrink-0 place-items-center rounded-full transition-all duration-300 ${
                    isCompleted
                      ? "bg-white text-primary shadow-sm"
                      : isActive
                        ? "border-2 border-white bg-white/20 font-semibold text-white"
                        : "border border-white/40 bg-transparent text-white/80"
                  }`}
                >
                  {isCompleted ? (
                    <Check
                      className="size-5 stroke-[3] text-primary"
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  <motion.span
                    key={`${currentRole}-${step.id}`}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 4 }}
                    transition={{ duration: 0.15 }}
                    className={`text-base transition-colors ${
                      isActive || isCompleted
                        ? "font-medium text-white"
                        : "font-normal text-white/80"
                    }`}
                  >
                    {step.label}
                  </motion.span>
                </AnimatePresence>
              </div>

              {!isLast && (
                <div className="my-1.5 ml-[17px] h-7 w-[2px] bg-white/30" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
