"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { Subject } from "@/types/data";

interface SubjectsStore {
  subjects: Subject[];
  loading: boolean;
  hasLoaded: boolean;
  lastLoadedUserId: string | null;

  loadSubjects: (userId: string, options?: { force?: boolean }) => Promise<Subject[]>;
  ensureSubjectsLoaded: (userId: string) => Promise<Subject[]>;
  setSubjects: (subjects: Subject[]) => void;
  reset: () => void;

  addSubject: (subject: Subject) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  removeSubject: (id: string) => void;
}

export const useSubjectsStore = create<SubjectsStore>((set, get) => {
  let loadPromise: Promise<Subject[]> | null = null;

  const fetchSubjects = async (userId: string): Promise<Subject[]> => {
    set({ loading: true });

    const { data, error } = await supabase
      .from("subjects")
      .select("id, user_id, name, semester, exam_date")
      .eq("user_id", userId)
      .order("name");

    if (error) {
      console.error("Error loading subjects:", error);
      set({ loading: false, hasLoaded: true, lastLoadedUserId: userId });
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
      hasLoaded: true,
      lastLoadedUserId: userId,
    });

    return mapped;
  };

  const loadSubjects = async (
    userId: string,
    options?: { force?: boolean }
  ): Promise<Subject[]> => {
    if (!userId) {
      set({ subjects: [], loading: false, hasLoaded: false, lastLoadedUserId: null });
      return [];
    }

    const { lastLoadedUserId, hasLoaded } = get();

    if (!options?.force && hasLoaded && lastLoadedUserId === userId) {
      return get().subjects;
    }

    if (loadPromise && !options?.force) {
      return loadPromise;
    }

    loadPromise = fetchSubjects(userId);
    const result = await loadPromise;
    loadPromise = null;
    return result;
  };

  const ensureSubjectsLoaded = async (userId: string): Promise<Subject[]> => {
    if (!userId) {
      return [];
    }

    const { hasLoaded, lastLoadedUserId } = get();
    if (hasLoaded && lastLoadedUserId === userId) {
      return get().subjects;
    }

    return loadSubjects(userId);
  };

  return {
    subjects: [],
    loading: false,
    hasLoaded: false,
    lastLoadedUserId: null,

    loadSubjects,
    ensureSubjectsLoaded,

    setSubjects: (subjects) =>
      set((state) => ({
        subjects,
        loading: false,
        hasLoaded: subjects.length > 0 ? true : false,
        lastLoadedUserId:
          subjects.length > 0
            ? subjects[0].userId
            : state.lastLoadedUserId,
      })),

    reset: () =>
      set({
        subjects: [],
        loading: false,
        hasLoaded: false,
        lastLoadedUserId: null,
      }),

    addSubject: (subject) =>
      set((state) => ({
        subjects: [...state.subjects, subject],
        hasLoaded: true,
        lastLoadedUserId: subject.userId,
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
