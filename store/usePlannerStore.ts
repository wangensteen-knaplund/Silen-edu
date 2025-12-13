import { create } from "zustand";
import { PlannerLiteData, PlannerProData } from "@/types/planner";

interface PlannerStore {
  plannerLiteBySubjectId: Record<string, PlannerLiteData>;
  plannerProBySubjectId: Record<string, PlannerProData>;
  setPlannerLite: (subjectId: string, data: PlannerLiteData) => void;
  setPlannerPro: (subjectId: string, data: PlannerProData) => void;
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
  setPlannerLite: (subjectId, data) =>
    set((state) => ({
      plannerLiteBySubjectId: {
        ...state.plannerLiteBySubjectId,
        [subjectId]: data,
      },
    })),
  setPlannerPro: (subjectId, data) =>
    set((state) => ({
      plannerProBySubjectId: {
        ...state.plannerProBySubjectId,
        [subjectId]: data,
      },
    })),
}));
