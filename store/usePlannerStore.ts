import { create } from "zustand";
import { PlannerLiteData, PlannerProData, Deadline, ReadingItem, Goal } from "@/types/planner";

interface PlannerStore {
  plannerLiteBySubjectId: Record<string, PlannerLiteData>;
  plannerProBySubjectId: Record<string, PlannerProData>;
  goalsBySubjectId: Record<string, Goal[]>;
  setExamDate: (subjectId: string, date: string) => void;
  addGoal: (subjectId: string, goal: Goal) => void;
  removeGoal: (subjectId: string, goalId: string) => void;
  addDeadline: (subjectId: string, deadline: Deadline) => void;
  removeDeadline: (subjectId: string, deadlineId: string) => void;
  addReadingItem: (subjectId: string, item: ReadingItem) => void;
  addReadingItemsFromText: (subjectId: string, rawText: string) => void;
  toggleReadingItem: (subjectId: string, itemId: string) => void;
  removeReadingItem: (subjectId: string, itemId: string) => void;
}

export const usePlannerStore = create<PlannerStore>((set) => ({
  plannerLiteBySubjectId: {
    // Placeholder data
    "1": {
      subjectId: "1",
      examDate: "2024-12-20",
    },
  },
  plannerProBySubjectId: {
    // Placeholder data (empty for now as it's a Pro feature)
  },
  goalsBySubjectId: {},
  setExamDate: (subjectId, date) =>
    set((state) => ({
      plannerLiteBySubjectId: {
        ...state.plannerLiteBySubjectId,
        [subjectId]: {
          subjectId,
          examDate: date,
        },
      },
    })),
  addGoal: (subjectId, goal) =>
    set((state) => ({
      goalsBySubjectId: {
        ...state.goalsBySubjectId,
        [subjectId]: [...(state.goalsBySubjectId[subjectId] || []), goal],
      },
    })),
  removeGoal: (subjectId, goalId) =>
    set((state) => ({
      goalsBySubjectId: {
        ...state.goalsBySubjectId,
        [subjectId]: (state.goalsBySubjectId[subjectId] || []).filter((g) => g.id !== goalId),
      },
    })),
  addDeadline: (subjectId, deadline) =>
    set((state) => {
      const existing = state.plannerProBySubjectId[subjectId] || {
        subjectId,
        examDate: state.plannerLiteBySubjectId[subjectId]?.examDate || "",
        deadlines: [],
        readingItems: [],
      };
      return {
        plannerProBySubjectId: {
          ...state.plannerProBySubjectId,
          [subjectId]: {
            ...existing,
            deadlines: [...existing.deadlines, deadline],
          },
        },
      };
    }),
  removeDeadline: (subjectId, deadlineId) =>
    set((state) => {
      const existing = state.plannerProBySubjectId[subjectId];
      if (!existing) return state;
      return {
        plannerProBySubjectId: {
          ...state.plannerProBySubjectId,
          [subjectId]: {
            ...existing,
            deadlines: existing.deadlines.filter((d) => d.id !== deadlineId),
          },
        },
      };
    }),
  addReadingItem: (subjectId, item) =>
    set((state) => {
      const existing = state.plannerProBySubjectId[subjectId] || {
        subjectId,
        examDate: state.plannerLiteBySubjectId[subjectId]?.examDate || "",
        deadlines: [],
        readingItems: [],
      };
      return {
        plannerProBySubjectId: {
          ...state.plannerProBySubjectId,
          [subjectId]: {
            ...existing,
            readingItems: [...existing.readingItems, item],
          },
        },
      };
    }),
  addReadingItemsFromText: (subjectId, rawText) =>
    set((state) => {
      const lines = rawText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      
      const newItems: ReadingItem[] = lines.map((line) => ({
        id: Math.random().toString(36).substring(2, 9),
        subjectId,
        text: line,
        completed: false,
      }));

      const existing = state.plannerProBySubjectId[subjectId] || {
        subjectId,
        examDate: state.plannerLiteBySubjectId[subjectId]?.examDate || "",
        deadlines: [],
        readingItems: [],
      };

      return {
        plannerProBySubjectId: {
          ...state.plannerProBySubjectId,
          [subjectId]: {
            ...existing,
            readingItems: [...existing.readingItems, ...newItems],
          },
        },
      };
    }),
  toggleReadingItem: (subjectId, itemId) =>
    set((state) => {
      const existing = state.plannerProBySubjectId[subjectId];
      if (!existing) return state;
      return {
        plannerProBySubjectId: {
          ...state.plannerProBySubjectId,
          [subjectId]: {
            ...existing,
            readingItems: existing.readingItems.map((item) =>
              item.id === itemId
                ? { ...item, completed: !item.completed }
                : item
            ),
          },
        },
      };
    }),
  removeReadingItem: (subjectId, itemId) =>
    set((state) => {
      const existing = state.plannerProBySubjectId[subjectId];
      if (!existing) return state;
      return {
        plannerProBySubjectId: {
          ...state.plannerProBySubjectId,
          [subjectId]: {
            ...existing,
            readingItems: existing.readingItems.filter((item) => item.id !== itemId),
          },
        },
      };
    }),
}));
