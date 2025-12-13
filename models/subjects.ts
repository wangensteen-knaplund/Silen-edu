import { Subject } from "@/types/data";

// Model functions for subjects
export type { Subject };

// Placeholder functions for future implementation
export async function fetchSubjects(userId: string): Promise<Subject[]> {
  // This will be implemented with Supabase
  return [];
}

export async function createSubject(subject: Omit<Subject, "id" | "createdAt">): Promise<Subject | null> {
  // This will be implemented with Supabase
  return null;
}

export async function updateSubject(id: string, updates: Partial<Subject>): Promise<Subject | null> {
  // This will be implemented with Supabase
  return null;
}

export async function deleteSubject(id: string): Promise<boolean> {
  // This will be implemented with Supabase
  return false;
}
