"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { Deadline, Goal, ReadingItem } from "@/types/planner";

interface PlannerSubjectState {
  goals: Goal[];
  deadlines: Deadline[];
  readingItems: ReadingItem[];
  loading: boolean;
  initialized: boolean;
  error?: string;
}

interface PlannerStore {
  dataBySubjectId: Record<string, PlannerSubjectState>;
  loadForSubject: (subjectId: string, userId: string) => Promise<PlannerSubjectState>;
  addGoal: (subjectId: string, userId: string, text: string) => Promise<Goal | null>;
  removeGoal: (subjectId: string, goalId: string, userId: string) => Promise<boolean>;
  addDeadline: (
    subjectId: string,
    userId: string,
    payload: Pick<Deadline, "title" | "dueDate" | "type">
  ) => Promise<Deadline | null>;
  removeDeadline: (subjectId: string, deadlineId: string, userId: string) => Promise<boolean>;
  addReadingItemsFromText: (
    subjectId: string,
    userId: string,
    rawText: string
  ) => Promise<ReadingItem[]>;
  toggleReadingItem: (
    subjectId: string,
    itemId: string,
    userId: string
  ) => Promise<ReadingItem | null>;
  removeReadingItem: (subjectId: string, itemId: string, userId: string) => Promise<boolean>;
  reset: () => void;
}

export const usePlannerStore = create<PlannerStore>((set, get) => {
  const ensureState = (
    subjectId: string,
    skipSet: boolean = false
  ): PlannerSubjectState => {
    const current = get().dataBySubjectId[subjectId];
    if (current) return current;
    const empty: PlannerSubjectState = {
      goals: [],
      deadlines: [],
      readingItems: [],
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

  const mapGoal = (g: any): Goal => ({
    id: g.id,
    subjectId: g.subject_id,
    text: g.text,
    createdAt: g.created_at,
  });

  const mapDeadline = (d: any): Deadline => ({
    id: d.id,
    subjectId: d.subject_id,
    title: d.title,
    dueDate: d.due_date,
    type: d.type,
    createdAt: d.created_at,
  });

  const mapReadingItem = (r: any): ReadingItem => ({
    id: r.id,
    subjectId: r.subject_id,
    text: r.text,
    completed: Boolean(r.completed),
    createdAt: r.created_at,
  });

  const loadForSubject = async (
    subjectId: string,
    userId: string
  ): Promise<PlannerSubjectState> => {
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

    const [goalsRes, deadlinesRes, readingRes] = await Promise.all([
      supabase
        .from("planner_goals")
        .select("id, subject_id, text, created_at")
        .eq("user_id", userId)
        .eq("subject_id", subjectId)
        .order("created_at", { ascending: true }),
      supabase
        .from("deadlines")
        .select("id, subject_id, title, due_date, type, created_at")
        .eq("user_id", userId)
        .eq("subject_id", subjectId)
        .order("due_date", { ascending: true }),
      supabase
        .from("reading_items")
        .select("id, subject_id, text, completed, created_at")
        .eq("user_id", userId)
        .eq("subject_id", subjectId)
        .order("created_at", { ascending: true }),
    ]);

    const error = goalsRes.error || deadlinesRes.error || readingRes.error;

    if (error) {
      console.error("Error loading planner data:", error);
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

    const nextState: PlannerSubjectState = {
      goals: (goalsRes.data || []).map(mapGoal),
      deadlines: (deadlinesRes.data || []).map(mapDeadline),
      readingItems: (readingRes.data || []).map(mapReadingItem),
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

  const addGoal = async (
    subjectId: string,
    userId: string,
    text: string
  ): Promise<Goal | null> => {
    if (!text.trim()) return null;

    const { data, error } = await supabase
      .from("planner_goals")
      .insert([{ user_id: userId, subject_id: subjectId, text: text.trim() }])
      .select("id, subject_id, text, created_at")
      .single();

    if (error || !data) {
      console.error("Error adding goal:", error);
      return null;
    }

    const goal = mapGoal(data);
    set((state) => {
      const current = ensureState(subjectId, true);
      return {
        dataBySubjectId: {
          ...state.dataBySubjectId,
          [subjectId]: {
            ...current,
            goals: [...current.goals, goal],
            initialized: true,
          },
        },
      };
    });

    return goal;
  };

  const removeGoal = async (
    subjectId: string,
    goalId: string,
    userId: string
  ): Promise<boolean> => {
    const { error } = await supabase
      .from("planner_goals")
      .delete()
      .eq("id", goalId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error removing goal:", error);
      return false;
    }

    set((state) => {
      const current = ensureState(subjectId, true);
      return {
        dataBySubjectId: {
          ...state.dataBySubjectId,
          [subjectId]: {
            ...current,
            goals: current.goals.filter((g) => g.id !== goalId),
          },
        },
      };
    });

    return true;
  };

  const addDeadline = async (
    subjectId: string,
    userId: string,
    payload: Pick<Deadline, "title" | "dueDate" | "type">
  ): Promise<Deadline | null> => {
    const { data, error } = await supabase
      .from("deadlines")
      .insert([
        {
          user_id: userId,
          subject_id: subjectId,
          title: payload.title,
          due_date: payload.dueDate,
          type: payload.type,
        },
      ])
      .select("id, subject_id, title, due_date, type, created_at")
      .single();

    if (error || !data) {
      console.error("Error adding deadline:", error);
      return null;
    }

    const deadline = mapDeadline(data);
    set((state) => {
      const current = ensureState(subjectId, true);
      return {
        dataBySubjectId: {
          ...state.dataBySubjectId,
          [subjectId]: {
            ...current,
            deadlines: [...current.deadlines, deadline],
            initialized: true,
          },
        },
      };
    });

    return deadline;
  };

  const removeDeadline = async (
    subjectId: string,
    deadlineId: string,
    userId: string
  ): Promise<boolean> => {
    const { error } = await supabase
      .from("deadlines")
      .delete()
      .eq("id", deadlineId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error removing deadline:", error);
      return false;
    }

    set((state) => {
      const current = ensureState(subjectId, true);
      return {
        dataBySubjectId: {
          ...state.dataBySubjectId,
          [subjectId]: {
            ...current,
            deadlines: current.deadlines.filter((d) => d.id !== deadlineId),
          },
        },
      };
    });

    return true;
  };

  const addReadingItemsFromText = async (
    subjectId: string,
    userId: string,
    rawText: string
  ): Promise<ReadingItem[]> => {
    const lines = rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) return [];

    const payload = lines.map((text) => ({
      user_id: userId,
      subject_id: subjectId,
      text,
      completed: false,
    }));

    const { data, error } = await supabase
      .from("reading_items")
      .insert(payload)
      .select("id, subject_id, text, completed, created_at");

    if (error || !data) {
      console.error("Error adding reading items:", error);
      return [];
    }

    const items = data.map(mapReadingItem);
    set((state) => {
      const current = ensureState(subjectId, true);
      return {
        dataBySubjectId: {
          ...state.dataBySubjectId,
          [subjectId]: {
            ...current,
            readingItems: [...current.readingItems, ...items],
            initialized: true,
          },
        },
      };
    });

    return items;
  };

  const toggleReadingItem = async (
    subjectId: string,
    itemId: string,
    userId: string
  ): Promise<ReadingItem | null> => {
    const current = ensureState(subjectId);
    const existing = current.readingItems.find((item) => item.id === itemId);
    const nextCompleted = existing ? !existing.completed : true;

    const { data, error } = await supabase
      .from("reading_items")
      .update({ completed: nextCompleted })
      .eq("id", itemId)
      .eq("user_id", userId)
      .select("id, subject_id, text, completed, created_at")
      .single();

    if (error || !data) {
      console.error("Error toggling reading item:", error);
      return null;
    }

    const updated = mapReadingItem(data);
    set((state) => {
      const currentState = ensureState(subjectId, true);
      return {
        dataBySubjectId: {
          ...state.dataBySubjectId,
          [subjectId]: {
            ...currentState,
            readingItems: currentState.readingItems.map((item) =>
              item.id === itemId ? updated : item
            ),
          },
        },
      };
    });

    return updated;
  };

  const removeReadingItem = async (
    subjectId: string,
    itemId: string,
    userId: string
  ): Promise<boolean> => {
    const { error } = await supabase
      .from("reading_items")
      .delete()
      .eq("id", itemId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error removing reading item:", error);
      return false;
    }

    set((state) => {
      const current = ensureState(subjectId, true);
      return {
        dataBySubjectId: {
          ...state.dataBySubjectId,
          [subjectId]: {
            ...current,
            readingItems: current.readingItems.filter((item) => item.id !== itemId),
          },
        },
      };
    });

    return true;
  };

  return {
    dataBySubjectId: {},
    loadForSubject,
    addGoal,
    removeGoal,
    addDeadline,
    removeDeadline,
    addReadingItemsFromText,
    toggleReadingItem,
    removeReadingItem,
    reset: () => set({ dataBySubjectId: {} }),
  };
});
