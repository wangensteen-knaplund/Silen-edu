"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { Note } from "@/types/data";

interface NotesStore {
  notes: Note[];
  loading: boolean;
  initialized: boolean;

  loadNotes: (userId: string) => Promise<Note[]>;
  getById: (noteId: string) => Note | undefined;
  getBySubject: (subjectId: string) => Note[];
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  removeNote: (id: string) => void;
  reset: () => void;
}

export const useNotesStore = create<NotesStore>((set, get) => {
  let loadPromise: Promise<Note[]> | null = null;
  let lastUserId: string | null = null;

  const fetchNotes = async (userId: string): Promise<Note[]> => {
    set({ loading: true });

    const { data, error } = await supabase
      .from("notes")
      .select("id, user_id, subject_id, content, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading notes:", error);
      set({ loading: false, initialized: true });
      return [];
    }

    const mappedNotes: Note[] = (data || []).map((n) => ({
      id: n.id,
      userId: n.user_id,
      subjectId: n.subject_id,
      content: n.content,
      createdAt: n.created_at,
      updatedAt: n.updated_at ?? undefined,
    }));

    set({ notes: mappedNotes, loading: false, initialized: true });
    return mappedNotes;
  };

  const loadNotes = async (userId: string): Promise<Note[]> => {
    if (!userId) {
      lastUserId = null;
      set({ notes: [], loading: false, initialized: false });
      return [];
    }

    if (get().initialized && !get().loading && lastUserId === userId) {
      return get().notes;
    }

    if (loadPromise) {
      return loadPromise;
    }

    lastUserId = userId;
    loadPromise = fetchNotes(userId);
    const result = await loadPromise;
    loadPromise = null;
    return result;
  };

  return {
    notes: [],
    loading: false,
    initialized: false,

    loadNotes,
    getById: (noteId) => get().notes.find((note) => note.id === noteId),
    getBySubject: (subjectId) =>
      get().notes.filter((note) => note.subjectId === subjectId),

    addNote: (note) =>
      set((state) => ({
        notes: [note, ...state.notes],
        initialized: true,
      })),

    updateNote: (id, updates) =>
      set((state) => ({
        notes: state.notes.map((note) =>
          note.id === id ? { ...note, ...updates } : note
        ),
      })),

    removeNote: (id) =>
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
      })),

    reset: () => {
      lastUserId = null;
      set({ notes: [], loading: false, initialized: false });
    },
  };
});
