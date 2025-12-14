"use client";

import { create } from "zustand";

type HydrationStatus = "idle" | "loading" | "ready" | "error";

interface AppStore {
  hydrationStatus: HydrationStatus;
  error?: string;
  startHydration: () => void;
  setReady: () => void;
  setError: (message: string) => void;
  reset: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  hydrationStatus: "idle",
  error: undefined,
  startHydration: () => set({ hydrationStatus: "loading", error: undefined }),
  setReady: () => set({ hydrationStatus: "ready", error: undefined }),
  setError: (message) => set({ hydrationStatus: "error", error: message }),
  reset: () => set({ hydrationStatus: "idle", error: undefined }),
}));
