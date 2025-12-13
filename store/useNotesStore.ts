"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { Note } from "@/types/data";

interface NotesStore {
  notesBySubjectId: Record<string, Note[]>;
  loading: boolean;

  loadNotes: (userId: string, subjectId: string) => Promise<void>;
  addNote: (note: Note) => void;
  updateNote: (id: string, subjectId: string, updates: Partial<Note>) => void;
  removeNote: (id: string, subjectId: string) => void;
  getNotesBySubject: (subjectId: string) => Note[];
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notesBySubjectId: {},
  loading: false,

  loadNotes: async (userId, subjectId) => {
    set({ loading: true });

    const { data, error } = await supabase
      .from("notes")
      .select("id, user_id, subject_id, title, content, created_at")
      .eq("user_id", userId)
      .eq("subject_id", subjectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading notes:", error);
      set({ loading: false });
      return;
    }

    const mappedNotes: Note[] = (data || []).map((n) => ({
      id: n.id,
      userId: n.user_id,
      subjectId: n.subject_id,
      title: n.title,
      content: n.content,
      createdAt: n.created_at,
    }));

    set((state) => ({
      notesBySubjectId: {
        ...state.notesBySubjectId,
        [subjectId]: mappedNotes,
      },
      loading: false,
    }));
  },

  addNote: (note) =>
    set((state) => ({
      notesBySubjectId: {
        ...state.notesBySubjectId,
        [note.subjectId]: [
          note,
          ...(state.notesBySubjectId[note.subjectId] || []),
        ],
      },
    })),

  updateNote: (id, subjectId, updates) =>
    set((state) => ({
      notesBySubjectId: {
        ...state.notesBySubjectId,
        [subjectId]: (state.notesBySubjectId[subjectId] || []).map((n) =>
          n.id === id ? { ...n, ...updates } : n
        ),
      },
    })),

  removeNote: (id, subjectId) =>
    set((state) => ({
      notesBySubjectId: {
        ...state.notesBySubjectId,
        [subjectId]: (state.notesBySubjectId[subjectId] || []).filter(
          (n) => n.id !== id
        ),
      },
    })),

  getNotesBySubject: (subjectId) =>
    get().notesBySubjectId[subjectId] || [],
}));
