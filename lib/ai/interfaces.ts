export type AIQuizQuestionType = "mcq" | "reflection" | "flashcard";

export interface AIQuizQuestion {
  id: string;
  type: AIQuizQuestionType;
  question: string;
  options?: string[];
  answer?: string;
}
