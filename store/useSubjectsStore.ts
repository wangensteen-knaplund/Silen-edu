"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { Subject } from "@/types/data";

interface SubjectsStore {
  subjects: Subject[];
  loading: boolean;
  initialized: boolean;
  error?: string;

  loadSubjects: (userId: string) => Promise<Subject[]>;
  getById: (subjectId: string) => Subject | undefined;
  createSubject: (
    subject: Pick<Subject, "name" | "semester" | "examDate"> & { userId: string }
  ) => Promise<Subject | null>;
  updateSubject: (
    id: string,
    updates: Partial<Pick<Subject, "name" | "semester" | "examDate">>
  ) => Promise<Subject | null>;
  removeSubject: (id: string, userId: string) => Promise<boolean>;
  reset: () => void;
}

export const useSubjectsStore = create<SubjectsStore>((set, get) => {
  let loadPromise: Promise<Subject[]> | null = null;
  let lastUserId: string | null = null;

  const fetchSubjects = async (userId: string): Promise<Subject[]> => {
    set({ loading: true, error: undefined });

    const { data, error } = await supabase
      .from("subjects")
      .select("id, user_id, name, semester, exam_date, created_at")
      .eq("user_id", userId)
      .order("name");

    if (error) {
      console.error("Error loading subjects:", error);
      set({ loading: false, initialized: true, error: error.message });
      throw error;
    }

    const mapped: Subject[] = (data ?? []).map((s) => ({
      id: s.id,
      userId: s.user_id,
      name: s.name,
      semester: s.semester ?? undefined,
      examDate: s.exam_date ?? undefined,
      createdAt: s.created_at,
    }));

    set({
      subjects: mapped,
      loading: false,
      initialized: true,
      error: undefined,
    });

    return mapped;
  };

  const loadSubjects = async (userId: string): Promise<Subject[]> => {
    if (!userId) {
      lastUserId = null;
      set({ subjects: [], loading: false, initialized: false });
      return [];
    }

    if (get().initialized && !get().loading && lastUserId === userId) {
      return get().subjects;
    }

    if (loadPromise) {
      return loadPromise;
    }

    lastUserId = userId;
    loadPromise = fetchSubjects(userId);
    const result = await loadPromise;
    loadPromise = null;
    return result;
  };

  return {
    subjects: [],
    loading: false,
    initialized: false,
    error: undefined,

    loadSubjects,
    getById: (subjectId) => get().subjects.find((s) => s.id === subjectId),

    createSubject: async ({ userId, name, semester, examDate }) => {
      const trimmedName = name.trim();
      if (!trimmedName) return null;

      const { data, error } = await supabase
        .from("subjects")
        .insert([
          {
            user_id: userId,
            name: trimmedName,
            semester: semester || null,
            exam_date: examDate || null,
          },
        ])
        .select()
        .single();

      if (error || !data) {
        console.error("Error creating subject:", error);
        set({ error: error?.message || "Kunne ikke opprette fag" });
        return null;
      }

      const created: Subject = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        semester: data.semester ?? undefined,
        examDate: data.exam_date ?? undefined,
        createdAt: data.created_at,
      };

      set((state) => ({
        subjects: [...state.subjects, created],
        initialized: true,
        error: undefined,
      }));

      return created;
    },

    updateSubject: async (id, updates) => {
      const payload: Record<string, string | null | undefined> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.semester !== undefined) payload.semester = updates.semester || null;
      if (updates.examDate !== undefined) payload.exam_date = updates.examDate || null;

      const { data, error } = await supabase
        .from("subjects")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error || !data) {
        console.error("Error updating subject:", error);
        set({ error: error?.message || "Kunne ikke oppdatere faget" });
        return null;
      }

      const updated: Subject = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        semester: data.semester ?? undefined,
        examDate: data.exam_date ?? undefined,
        createdAt: data.created_at,
      };

      set((state) => ({
        subjects: state.subjects.map((s) => (s.id === id ? updated : s)),
        error: undefined,
      }));

      return updated;
    },

    removeSubject: async (id, userId) => {
      const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        console.error("Error removing subject:", error);
        set({ error: error.message });
        return false;
      }

      set((state) => ({
        subjects: state.subjects.filter((s) => s.id !== id),
        error: undefined,
      }));

      return true;
    },

    reset: () => {
      lastUserId = null;
      set({ subjects: [], loading: false, initialized: false, error: undefined });
    },
  };
});
