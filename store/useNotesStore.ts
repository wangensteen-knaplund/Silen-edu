"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { Note } from "@/types/data";

interface NotesStore {
  notes: Note[];
  loading: boolean;
  initialized: boolean;
  error?: string;

  loadNotes: (userId: string) => Promise<Note[]>;
  getById: (noteId: string) => Note | undefined;
  getBySubject: (subjectId: string) => Note[];
  createNote: (
    payload: Pick<Note, "title" | "content" | "subjectId"> & { userId: string; isPublic?: boolean }
  ) => Promise<Note | null>;
  updateNote: (
    id: string,
    userId: string,
    updates: Partial<Pick<Note, "title" | "content" | "isPublic">>
  ) => Promise<Note | null>;
  removeNote: (id: string, userId: string) => Promise<boolean>;
  reset: () => void;
}

export const useNotesStore = create<NotesStore>((set, get) => {
  let loadPromise: Promise<Note[]> | null = null;
  let lastUserId: string | null = null;

  const fetchNotes = async (userId: string): Promise<Note[]> => {
    set({ loading: true, error: undefined });

    const { data, error } = await supabase
      .from("notes")
      .select(
        "id, user_id, subject_id, title, content, is_public, public_id, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading notes:", error);
      set({ loading: false, initialized: true, error: error.message });
      throw error;
    }

    const mappedNotes: Note[] = (data || []).map((n) => ({
      id: n.id,
      userId: n.user_id,
      subjectId: n.subject_id,
      title: n.title || "Uten tittel",
      content: n.content,
      isPublic: n.is_public ?? false,
      publicId: n.public_id,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    }));

    set({ notes: mappedNotes, loading: false, initialized: true, error: undefined });
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
    error: undefined,

    loadNotes,
    getById: (noteId) => get().notes.find((note) => note.id === noteId),
    getBySubject: (subjectId) =>
      get().notes.filter((note) => note.subjectId === subjectId),

    createNote: async ({ userId, title, content, subjectId, isPublic }) => {
      const payload = {
        user_id: userId,
        subject_id: subjectId,
        title: title?.trim() || "Uten tittel",
        content: content.trim(),
        is_public: Boolean(isPublic),
      };

      const { data, error } = await supabase
        .from("notes")
        .insert([payload])
        .select(
          "id, user_id, subject_id, title, content, is_public, public_id, created_at, updated_at"
        )
        .single();

      if (error || !data) {
        console.error("Error creating note:", error);
        set({ error: error?.message || "Kunne ikke opprette notat" });
        return null;
      }

      const created: Note = {
        id: data.id,
        userId: data.user_id,
        subjectId: data.subject_id,
        title: data.title || "Uten tittel",
        content: data.content,
        isPublic: data.is_public ?? false,
        publicId: data.public_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      set((state) => ({
        notes: [created, ...state.notes],
        initialized: true,
        error: undefined,
      }));

      return created;
    },

    updateNote: async (id, userId, updates) => {
      const payload: Record<string, string | boolean | null | undefined> = {};
      if (updates.title !== undefined)
        payload.title = updates.title?.trim() || "Uten tittel";
      if (updates.content !== undefined) payload.content = updates.content;
      if (updates.isPublic !== undefined) payload.is_public = updates.isPublic;

      const { data, error } = await supabase
        .from("notes")
        .update(payload)
        .eq("id", id)
        .eq("user_id", userId)
        .select(
          "id, user_id, subject_id, title, content, is_public, public_id, created_at, updated_at"
        )
        .single();

      if (error || !data) {
        console.error("Error updating note:", error);
        set({ error: error?.message || "Kunne ikke oppdatere notat" });
        return null;
      }

      const updated: Note = {
        id: data.id,
        userId: data.user_id,
        subjectId: data.subject_id,
        title: data.title || "Uten tittel",
        content: data.content,
        isPublic: data.is_public ?? false,
        publicId: data.public_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      set((state) => ({
        notes: state.notes.map((note) => (note.id === id ? updated : note)),
        error: undefined,
      }));

      return updated;
    },

    removeNote: async (id, userId) => {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        console.error("Error removing note:", error);
        set({ error: error.message });
        return false;
      }

      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
        error: undefined,
      }));

      return true;
    },

    reset: () => {
      lastUserId = null;
      set({ notes: [], loading: false, initialized: false, error: undefined });
    },
  };
});
