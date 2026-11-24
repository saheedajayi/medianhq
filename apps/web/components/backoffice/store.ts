import { create } from "zustand";

type BackofficeStore = {
  isAccessGranted: boolean;
  /** Sent to the API as x-backoffice-key; kept in memory only, so a reload asks again */
  accessKey: string | null;
  grantAccess: (accessKey: string) => void;
};

export const useBackofficeStore = create<BackofficeStore>((set) => ({
  isAccessGranted: false,
  accessKey: null,
  grantAccess: (accessKey) => set({ isAccessGranted: true, accessKey }),
}));
