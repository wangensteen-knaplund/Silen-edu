import { create } from "zustand";
import { Note } from "@/types/data";

interface NotesStore {
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  removeNote: (id: string) => void;
  getNotesBySubject: (subjectId: string) => Note[];
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [
    // Placeholder data
    {
      id: "note-1",
      subjectId: "1",
      userId: "user-1",
      title: "Derivasjon",
      content: "Notater om derivasjon...",
      createdAt: "2024-12-01T10:00:00Z",
    },
  ],
  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  updateNote: (id, updates) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    })),
  removeNote: (id) =>
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
  getNotesBySubject: (subjectId) => {
    return get().notes.filter((n) => n.subjectId === subjectId);
  },
}));
