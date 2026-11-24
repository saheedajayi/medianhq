"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type OnboardingRole = "MENTEE" | "MENTOR";

interface OnboardingContextType {
  role: OnboardingRole;
  setRole: (role: OnboardingRole) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined,
);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<OnboardingRole>("MENTEE");

  return (
    <OnboardingContext.Provider value={{ role, setRole }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
