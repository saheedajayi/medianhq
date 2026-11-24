import { create } from "zustand";
import type {
  WaitlistAudienceTab,
  WaitlistFieldErrors,
  WaitlistSubmitState,
} from "@/services/waitlist";

type WaitlistStore = {
  audience: WaitlistAudienceTab;
  submitState: WaitlistSubmitState;
  message: string;
  errors: WaitlistFieldErrors;
  setAudience: (audience: WaitlistAudienceTab) => void;
  setSubmitState: (submitState: WaitlistSubmitState) => void;
  setMessage: (message: string) => void;
  setErrors: (errors: WaitlistFieldErrors) => void;
  resetFeedback: () => void;
  resetFormState: () => void;
};

export const useWaitlistStore = create<WaitlistStore>((set) => ({
  audience: "mentors",
  submitState: "idle",
  message: "",
  errors: {},
  setAudience: (audience) => set({ audience }),
  setSubmitState: (submitState) => set({ submitState }),
  setMessage: (message) => set({ message }),
  setErrors: (errors) => set({ errors }),
  resetFeedback: () => set({ message: "", errors: {} }),
  resetFormState: () =>
    set({
      submitState: "idle",
      message: "",
      errors: {},
    }),
}));
