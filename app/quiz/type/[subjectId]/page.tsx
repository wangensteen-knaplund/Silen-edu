"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSubjectsStore } from "@/store/useSubjectsStore";
import { useQuizStore } from "@/store/useQuizStore";
import QuizTypeCard from "@/components/quiz/QuizTypeCard";
import { nanoid } from "nanoid";

export default function QuizTypePage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;

  const subjects = useSubjectsStore((state) => state.subjects);
  const createSession = useQuizStore((state) => state.createSession);

  const subject = subjects.find((s) => s.id === subjectId);

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Fag ikke funnet</p>
            <Link href="/quiz" className="text-blue-600 hover:underline mt-4 inline-block">
              Tilbake til quiz
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleStartQuiz = (type: "flashcard" | "mcq_basic" | "mcq_ai" | "reflection_ai") => {
    if (type === "flashcard") {
      router.push(`/quiz/flashcards/${subjectId}`);
    } else if (type === "mcq_ai" || type === "reflection_ai") {
      alert("Denne funksjonen er ikke implementert ennå (Pro/AI)");
    } else {
      // Create a basic MCQ session
      const sessionId = nanoid();
      const session = {
        id: sessionId,
        subjectId,
        userId: "user-1",
        type,
        questions: [
          {
            id: "q1",
            type: "mcq_basic" as const,
            question: "Hva er 2 + 2?",
            options: ["3", "4", "5", "6"],
            correctAnswer: "4",
          },
          {
            id: "q2",
            type: "mcq_basic" as const,
            question: "Hva er hovedstaden i Norge?",
            options: ["Bergen", "Oslo", "Trondheim", "Stavanger"],
            correctAnswer: "Oslo",
          },
        ],
        startedAt: new Date().toISOString(),
      };
      createSession(session);
      router.push(`/quiz/session/${sessionId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link
              href="/quiz"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-2 inline-block"
            >
              ← Tilbake til quiz
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {subject.name} - Velg quiz-type
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuizTypeCard
              title="Flashcards"
              description="Øv med flashcards for å repetere nøkkelbegreper"
              isFree={true}
              isPro={false}
              isAI={false}
              onClick={() => handleStartQuiz("flashcard")}
            />
            <QuizTypeCard
              title="Basic Multiple Choice"
              description="Test deg selv med flervalgsspørsmål"
              isFree={true}
              isPro={false}
              isAI={false}
              onClick={() => handleStartQuiz("mcq_basic")}
            />
            <QuizTypeCard
              title="AI Multiple Choice"
              description="AI-genererte flervalgsspørsmål basert på notatene dine"
              isFree={false}
              isPro={true}
              isAI={true}
              onClick={() => handleStartQuiz("mcq_ai")}
            />
            <QuizTypeCard
              title="AI Reflection"
              description="Dypere refleksjonsspørsmål generert av AI"
              isFree={false}
              isPro={true}
              isAI={true}
              onClick={() => handleStartQuiz("reflection_ai")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
