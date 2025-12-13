import { PlannerLiteData, PlannerProData, Deadline, ReadingItem } from "@/types/planner";

// Model functions for planner
export type { PlannerLiteData, PlannerProData, Deadline, ReadingItem };

// Placeholder functions for future implementation
export async function fetchPlannerLite(subjectId: string): Promise<PlannerLiteData | null> {
  // This will be implemented with Supabase
  return null;
}

export async function savePlannerLite(data: PlannerLiteData): Promise<PlannerLiteData | null> {
  // This will be implemented with Supabase
  return null;
}

export async function fetchPlannerPro(subjectId: string): Promise<PlannerProData | null> {
  // This will be implemented with Supabase
  return null;
}

export async function savePlannerPro(data: PlannerProData): Promise<PlannerProData | null> {
  // This will be implemented with Supabase
  return null;
}
