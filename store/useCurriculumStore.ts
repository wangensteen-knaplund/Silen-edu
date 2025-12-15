"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { CurriculumItem } from "@/types/data";

interface CurriculumSubjectState {
  items: CurriculumItem[];
  loading: boolean;
  initialized: boolean;
  error?: string;
}

interface CurriculumStore {
  dataBySubjectId: Record<string, CurriculumSubjectState>;
  loadForSubject: (subjectId: string, userId: string) => Promise<CurriculumSubjectState>;
  addItemsFromText: (
    subjectId: string,
    userId: string,
    rawText: string
  ) => Promise<CurriculumItem[]>;
  toggleItem: (
    subjectId: string,
    itemId: string,
    userId: string
  ) => Promise<CurriculumItem | null>;
  removeItem: (subjectId: string, itemId: string, userId: string) => Promise<boolean>;
  reset: () => void;
}

export const useCurriculumStore = create<CurriculumStore>((set, get) => {
  const ensureState = (
    subjectId: string,
    skipSet: boolean = false
  ): CurriculumSubjectState => {
    const current = get().dataBySubjectId[subjectId];
    if (current) return current;
    const empty: CurriculumSubjectState = {
      items: [],
      loading: false,
      initialized: false,
    };
    if (!skipSet) {
      set((state) => ({
        dataBySubjectId: { ...state.dataBySubjectId, [subjectId]: empty },
      }));
    }
    return empty;
  };

  const mapItem = (item: any): CurriculumItem => ({
    id: item.id,
    userId: item.user_id,
    subjectId: item.subject_id,
    title: item.title,
    completed: Boolean(item.completed),
    createdAt: item.created_at,
  });

  const loadForSubject = async (
    subjectId: string,
    userId: string
  ): Promise<CurriculumSubjectState> => {
    if (!userId) return ensureState(subjectId);

    const existing = get().dataBySubjectId[subjectId];
    if (existing?.initialized && !existing.loading) return existing;

    const baseState = ensureState(subjectId, true);

    set((state) => ({
      dataBySubjectId: {
        ...state.dataBySubjectId,
        [subjectId]: { ...baseState, loading: true, error: undefined },
      },
    }));

    const { data, error } = await supabase
      .from("curriculum_items")
      .select("id, user_id, subject_id, title, completed, created_at")
      .eq("user_id", userId)
      .eq("subject_id", subjectId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading curriculum items:", error);
      const existingState = ensureState(subjectId, true);
      set((state) => ({
        dataBySubjectId: {
          ...state.dataBySubjectId,
          [subjectId]: {
            ...existingState,
            loading: false,
            initialized: true,
            error: error.message,
          },
        },
      }));
      throw error;
    }

    const nextState: CurriculumSubjectState = {
      items: (data || []).map(mapItem),
      loading: false,
      initialized: true,
      error: undefined,
    };

    set((state) => ({
      dataBySubjectId: {
        ...state.dataBySubjectId,
        [subjectId]: nextState,
      },
    }));

    return nextState;
  };

  const addItemsFromText = async (
    subjectId: string,
    userId: string,
    rawText: string
  ): Promise<CurriculumItem[]> => {
    const lines = rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) return [];

    const payload = lines.map((title) => ({
      user_id: userId,
      subject_id: subjectId,
      title,
      completed: false,
    }));

    const { data, error } = await supabase
      .from("curriculum_items")
      .insert(payload)
      .select("id, user_id, subject_id, title, completed, created_at");

    if (error || !data) {
      console.error("Error adding curriculum items:", error);
      return [];
    }

    const items = data.map(mapItem);
    set((state) => {
      const current = ensureState(subjectId, true);
      return {
        dataBySubjectId: {
          ...state.dataBySubjectId,
          [subjectId]: {
            ...current,
            items: [...current.items, ...items],
            initialized: true,
          },
        },
      };
    });

    return items;
  };

  const toggleItem = async (
    subjectId: string,
    itemId: string,
    userId: string
  ): Promise<CurriculumItem | null> => {
    const current = ensureState(subjectId);
    const existing = current.items.find((item) => item.id === itemId);
    const nextCompleted = existing ? !existing.completed : true;

    const { data, error } = await supabase
      .from("curriculum_items")
      .update({ completed: nextCompleted })
      .eq("id", itemId)
      .eq("user_id", userId)
      .select("id, user_id, subject_id, title, completed, created_at")
      .single();

    if (error || !data) {
      console.error("Error toggling curriculum item:", error);
      return null;
    }

    const updated = mapItem(data);
    set((state) => {
      const currentState = ensureState(subjectId, true);
      return {
        dataBySubjectId: {
          ...state.dataBySubjectId,
          [subjectId]: {
            ...currentState,
            items: currentState.items.map((item) =>
              item.id === itemId ? updated : item
            ),
          },
        },
      };
    });

    return updated;
  };

  const removeItem = async (
    subjectId: string,
    itemId: string,
    userId: string
  ): Promise<boolean> => {
    const { error } = await supabase
      .from("curriculum_items")
      .delete()
      .eq("id", itemId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error removing curriculum item:", error);
      return false;
    }

    set((state) => {
      const current = ensureState(subjectId, true);
      return {
        dataBySubjectId: {
          ...state.dataBySubjectId,
          [subjectId]: {
            ...current,
            items: current.items.filter((item) => item.id !== itemId),
          },
        },
      };
    });

    return true;
  };

  return {
    dataBySubjectId: {},
    loadForSubject,
    addItemsFromText,
    toggleItem,
    removeItem,
    reset: () => set({ dataBySubjectId: {} }),
  };
});
