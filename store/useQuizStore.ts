import { create } from "zustand";
import { QuizSession } from "@/types/quiz";

interface QuizStore {
  sessions: QuizSession[];
  setSessions: (sessions: QuizSession[]) => void;
  createSession: (session: QuizSession) => void;
  getSessionById: (id: string) => QuizSession | undefined;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  sessions: [
    // Placeholder data
  ],
  setSessions: (sessions) => set({ sessions }),
  createSession: (session) =>
    set((state) => ({ sessions: [...state.sessions, session] })),
  getSessionById: (id) => {
    return get().sessions.find((s) => s.id === id);
  },
}));
