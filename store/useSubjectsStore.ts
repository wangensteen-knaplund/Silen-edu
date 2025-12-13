"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { Subject } from "@/types/data";

interface SubjectsStore {
  subjects: Subject[];
  loading: boolean;
  initialized: boolean;
  loadSubjects: (userId: string) => Promise<void>;
  setSubjects: (subjects: Subject[]) => void;
  addSubject: (subject: Subject) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  removeSubject: (id: string) => void;
}

export const useSubjectsStore = create<SubjectsStore>((set) => ({
  subjects: [],
  loading: false,
  initialized: false,
  loadSubjects: async (userId: string) => {
    set({ loading: true, initialized: false });

    const { data, error } = await supabase
      .from("subjects")
      .select("id, user_id, name, semester, exam_date")
      .eq("user_id", userId)
      .order("name");

    if (error) {
      console.error("Error loading subjects:", error);
      set({ subjects: [], loading: false, initialized: true });
      return;
    }

    const mappedSubjects: Subject[] = (data || []).map((subject) => ({
      id: subject.id,
      userId: subject.user_id,
      name: subject.name,
      semester: subject.semester ?? undefined,
      examDate: subject.exam_date ?? undefined,
    }));

    set({ subjects: mappedSubjects, loading: false, initialized: true });
  },
  setSubjects: (subjects) => set({ subjects, initialized: true }),
  addSubject: (subject) =>
    set((state) => ({ subjects: [...state.subjects, subject] })),
  updateSubject: (id, updates) =>
    set((state) => ({
      subjects: state.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  removeSubject: (id) =>
    set((state) => ({ subjects: state.subjects.filter((s) => s.id !== id) })),
}));
