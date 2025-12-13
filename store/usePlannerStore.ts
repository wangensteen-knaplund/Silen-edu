import { create } from "zustand";
import { PlannerLiteData, PlannerProData, Deadline, ReadingItem } from "@/types/planner";

interface PlannerStore {
  plannerLiteBySubjectId: Record<string, PlannerLiteData>;
  plannerProBySubjectId: Record<string, PlannerProData>;
  setExamDate: (subjectId: string, date: string) => void;
  addDeadline: (subjectId: string, deadline: Deadline) => void;
  removeDeadline: (subjectId: string, deadlineId: string) => void;
  addReadingItem: (subjectId: string, item: ReadingItem) => void;
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
