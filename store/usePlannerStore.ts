"use client";

import { create } from "zustand";
import {
  PlannerLiteData,
  PlannerProData,
  Deadline,
  ReadingItem,
  Goal,
} from "@/types/planner";
import { Subject } from "@/types/data";
import { nanoid } from "nanoid";

interface PlannerStore {
  plannerLiteBySubjectId: Record<string, PlannerLiteData>;
  plannerProBySubjectId: Record<string, PlannerProData>;
  goalsBySubjectId: Record<string, Goal[]>;
  loading: boolean;
  initialized: boolean;
  hydrateFromSubjects: (subjects: Subject[]) => void;
  reset: () => void;
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
  plannerLiteBySubjectId: {},
  plannerProBySubjectId: {},
  goalsBySubjectId: {},
  loading: false,
  initialized: false,
  hydrateFromSubjects: (subjects) => {
    set({ loading: true });
    set((state) => {
      const nextLite: Record<string, PlannerLiteData> = {};

      subjects.forEach((subject) => {
        if (subject.examDate) {
          nextLite[subject.id] = {
            subjectId: subject.id,
            examDate: subject.examDate,
          };
        } else if (state.plannerLiteBySubjectId[subject.id]) {
          nextLite[subject.id] = state.plannerLiteBySubjectId[subject.id];
        }
      });

      return {
        plannerLiteBySubjectId: nextLite,
        plannerProBySubjectId: Object.fromEntries(
          Object.entries(state.plannerProBySubjectId).filter(([subjectId]) =>
            subjects.some((subject) => subject.id === subjectId)
          )
        ),
        goalsBySubjectId: Object.fromEntries(
          Object.entries(state.goalsBySubjectId).filter(([subjectId]) =>
            subjects.some((subject) => subject.id === subjectId)
          )
        ),
        loading: false,
        initialized: true,
      };
    });
  },
  reset: () =>
    set({
      plannerLiteBySubjectId: {},
      plannerProBySubjectId: {},
      goalsBySubjectId: {},
      loading: false,
      initialized: false,
    }),
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
        id: nanoid(),
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
