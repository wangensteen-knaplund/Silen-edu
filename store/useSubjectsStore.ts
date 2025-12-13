import { create } from "zustand";
import { Subject } from "@/types/data";

interface SubjectsStore {
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;
  addSubject: (subject: Subject) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  removeSubject: (id: string) => void;
}

export const useSubjectsStore = create<SubjectsStore>((set) => ({
  subjects: [
    // Placeholder data
    {
      id: "1",
      userId: "user-1",
      name: "Matematikk 1",
      semester: "Høst 2024",
      examDate: "2024-12-20",
    },
    {
      id: "2",
      userId: "user-1",
      name: "Programmering",
      semester: "Høst 2024",
      examDate: "2024-12-15",
    },
  ],
  setSubjects: (subjects) => set({ subjects }),
  addSubject: (subject) =>
    set((state) => ({ subjects: [...state.subjects, subject] })),
  updateSubject: (id, updates) =>
    set((state) => ({
      subjects: state.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  removeSubject: (id) =>
    set((state) => ({ subjects: state.subjects.filter((s) => s.id !== id) })),
}));
