"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { Subject } from "@/types/data";

interface SubjectsStore {
  subjects: Subject[];
  loading: boolean;
  initialized: boolean;

  loadSubjects: (userId: string) => Promise<Subject[]>;
  getById: (subjectId: string) => Subject | undefined;
  reset: () => void;
  addSubject: (subject: Subject) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  removeSubject: (id: string) => void;
}

export const useSubjectsStore = create<SubjectsStore>((set, get) => {
  let loadPromise: Promise<Subject[]> | null = null;
  let lastUserId: string | null = null;

  const fetchSubjects = async (userId: string): Promise<Subject[]> => {
    set({ loading: true });

    const { data, error } = await supabase
      .from("subjects")
      .select("id, user_id, name, semester, exam_date")
      .eq("user_id", userId)
      .order("name");

    if (error) {
      console.error("Error loading subjects:", error);
      set({ loading: false, initialized: true });
      return [];
    }

    const mapped: Subject[] = (data ?? []).map((s) => ({
      id: s.id,
      userId: s.user_id,
      name: s.name,
      semester: s.semester ?? undefined,
      examDate: s.exam_date ?? undefined,
    }));

    set({
      subjects: mapped,
      loading: false,
      initialized: true,
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

    loadSubjects,
    getById: (subjectId) => get().subjects.find((s) => s.id === subjectId),

    reset: () => {
      lastUserId = null;
      set({ subjects: [], loading: false, initialized: false });
    },

    addSubject: (subject) =>
      set((state) => ({
        subjects: [...state.subjects, subject],
        initialized: true,
      })),

    updateSubject: (id, updates) =>
      set((state) => ({
        subjects: state.subjects.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      })),

    removeSubject: (id) =>
      set((state) => ({
        subjects: state.subjects.filter((s) => s.id !== id),
      })),
  };
});
