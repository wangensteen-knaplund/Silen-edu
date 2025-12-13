import { Note } from "@/types/data";
import { QuizQuestion } from "@/types/quiz";
import { nanoid } from "nanoid";

/**
 * Generate basic MCQ questions from notes (rule-based, non-AI)
 * Rules:
 * - Use note title as question
 * - Use first sentence of note content as correct answer
 * - Use first sentences from other notes as wrong options
 * - Limit to 4 options per question
 * - Shuffle options
 */
export function generateBasicMCQFromNotes(notes: Note[]): QuizQuestion[] {
  if (notes.length === 0) {
    return [];
  }

  const questions: QuizQuestion[] = [];

  for (let i = 0; i < notes.length; i++) {
    const currentNote = notes[i];
    
    // Extract first sentence from content
    const firstSentence = extractFirstSentence(currentNote.content);
    
    if (!firstSentence || firstSentence.length < 5) {
      continue; // Skip if content is too short
    }

    // Collect wrong answers from other notes
    const wrongAnswers: string[] = [];
    for (let j = 0; j < notes.length && wrongAnswers.length < 3; j++) {
      if (i !== j) {
        const wrongSentence = extractFirstSentence(notes[j].content);
        if (wrongSentence && wrongSentence.length >= 5) {
          wrongAnswers.push(wrongSentence);
        }
      }
    }

    // Only create question if we have enough wrong answers to form a meaningful quiz
    if (wrongAnswers.length >= 1) {
      const allOptions = [firstSentence, ...wrongAnswers].slice(0, 4);
      const shuffledOptions = shuffleArray(allOptions);

      questions.push({
        id: nanoid(),
        type: "mcq_basic",
        question: currentNote.title,
        options: shuffledOptions,
        correctAnswer: firstSentence,
      });
    }
  }

  return questions;
}

/**
 * Extract the first sentence from text
 */
function extractFirstSentence(text: string): string {
  if (!text) return "";
  
  // Clean up the text
  const cleaned = text.trim();
  
  // Try to find sentence ending with . ! or ?
  const match = cleaned.match(/^[^.!?]+[.!?]/);
  if (match) {
    return match[0].trim();
  }
  
  // If no sentence ending found, take first 100 characters or up to newline
  const firstLine = cleaned.split('\n')[0];
  return firstLine.substring(0, 100).trim();
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
