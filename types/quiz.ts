export type QuizType = "flashcard" | "mcq_basic" | "mcq_ai" | "reflection_ai";

export interface QuizQuestion {
  id: string;
  type: QuizType;
  question: string;
  options?: string[];
  correctAnswer?: string;
  frontText?: string; // for flashcards
  backText?: string; // for flashcards
}

export interface QuizSession {
  id: string;
  subjectId: string;
  userId: string;
  type: QuizType;
  questions: QuizQuestion[];
  startedAt: string;
  completedAt?: string;
}
