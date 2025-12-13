import { QuizSession, QuizQuestion } from "@/types/quiz";

// Model functions for quiz
export type { QuizSession, QuizQuestion };

// Placeholder functions for future implementation
export async function fetchQuizSessions(userId: string, subjectId?: string): Promise<QuizSession[]> {
  // This will be implemented with Supabase
  return [];
}

export async function createQuizSession(session: Omit<QuizSession, "id" | "startedAt">): Promise<QuizSession | null> {
  // This will be implemented with Supabase
  return null;
}

export async function fetchQuizSessionById(id: string): Promise<QuizSession | null> {
  // This will be implemented with Supabase
  return null;
}

export async function completeQuizSession(id: string): Promise<boolean> {
  // This will be implemented with Supabase
  return false;
}
