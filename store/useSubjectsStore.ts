"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { Subject } from "@/types/data";

interface SubjectsStore {
  subjects: Subject[];
  loading: boolean;
  hasLoaded: boolean;

  loadSubjects: (userId: string) => Promise<void>;
  ensureSubjectsLoaded: (userId: string) => Promise<void>;

  addSubject: (subject: Subject) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  removeSubject: (id: string) => void;
}

export const useSubjectsStore = create<SubjectsStore>((set, get) => ({
  subjects: [],
  loading: false,
  hasLoaded: false,

  loadSubjects: async (userId: string) => {
    // 🔒 unngå parallelle kall
    if (get().loading) return;

    set({ loading: true });

    const { data, error } = await supabase
      .from("subjects")
      .select("id, user_id, name, semester, exam_date")
      .eq("user_id", userId)
      .order("name");

    if (error) {
      console.error("Error loading subjects:", error);
      set({ loading: false, hasLoaded: true });
      return;
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
      hasLoaded: true,
    });
  },

  // ✅ TRYGG ENTRYPOINT
  ensureSubjectsLoaded: async (userId: string) => {
    const { hasLoaded, loading } = get();
    if (!hasLoaded && !loading) {
      await get().loadSubjects(userId);
    }
  },

  addSubject: (subject) =>
    set((state) => ({
      subjects: [...state.subjects, subject],
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
    })
