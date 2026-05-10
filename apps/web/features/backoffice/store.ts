import { create } from "zustand";

type BackofficeStore = {
  isAccessGranted: boolean;
  grantAccess: () => void;
};

export const useBackofficeStore = create<BackofficeStore>((set) => ({
  isAccessGranted: false,
  grantAccess: () => set({ isAccessGranted: true }),
}));
