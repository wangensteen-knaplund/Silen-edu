import { create } from "zustand";
import { QuizSession } from "@/types/quiz";

interface Flashcard {
  id: string;
  subjectId: string;
  front: string;
  back: string;
}

interface QuizStore {
  sessions: QuizSession[];
  flashcardsBySubjectId: Record<string, Flashcard[]>;
  setSessions: (sessions: QuizSession[]) => void;
  createSession: (session: QuizSession) => void;
  getSessionById: (id: string) => QuizSession | undefined;
  addFlashcard: (flashcard: Flashcard) => void;
  removeFlashcard: (subjectId: string, flashcardId: string) => void;
  getFlashcardsBySubject: (subjectId: string) => Flashcard[];
  createQuizSession: (subjectId: string, type: QuizSession["type"], questions: QuizSession["questions"]) => string;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  sessions: [
    // Placeholder data
  ],
  flashcardsBySubjectId: {
    // Placeholder flashcards
    "1": [
      {
        id: "fc1",
        subjectId: "1",
        front: "Hva er derivasjon?",
        back: "Derivasjon er et mål på hvor raskt en funksjon endrer seg",
      },
      {
        id: "fc2",
        subjectId: "1",
        front: "Hva er integrasjon?",
        back: "Integrasjon er den motsatte operasjonen av derivasjon",
      },
      {
        id: "fc3",
        subjectId: "1",
        front: "Hva er en grenseverdi?",
        back: "En grenseverdi beskriver verdien en funksjon nærmer seg",
      },
    ],
  },
  setSessions: (sessions) => set({ sessions }),
  createSession: (session) =>
    set((state) => ({ sessions: [...state.sessions, session] })),
  getSessionById: (id) => {
    return get().sessions.find((s) => s.id === id);
  },
  addFlashcard: (flashcard) =>
    set((state) => {
      const existing = state.flashcardsBySubjectId[flashcard.subjectId] || [];
      return {
        flashcardsBySubjectId: {
          ...state.flashcardsBySubjectId,
          [flashcard.subjectId]: [...existing, flashcard],
        },
      };
    }),
  removeFlashcard: (subjectId, flashcardId) =>
    set((state) => {
      const existing = state.flashcardsBySubjectId[subjectId] || [];
      return {
        flashcardsBySubjectId: {
          ...state.flashcardsBySubjectId,
          [subjectId]: existing.filter((fc) => fc.id !== flashcardId),
        },
      };
    }),
  getFlashcardsBySubject: (subjectId) => {
    return get().flashcardsBySubjectId[subjectId] || [];
  },
  createQuizSession: (subjectId, type, questions) => {
    const sessionId = `session-${Date.now()}`;
    const session: QuizSession = {
      id: sessionId,
      subjectId,
      userId: "user-1",
      type,
      questions,
      startedAt: new Date().toISOString(),
    };
    get().createSession(session);
    return sessionId;
  },
}));
