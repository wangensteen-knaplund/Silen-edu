"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { useQuizStore } from "@/store/useQuizStore";
import { useNotesStore } from "@/store/useNotesStore";
import QuizTypeCard from "@/components/quiz/QuizTypeCard";
import { generateBasicMCQFromNotes } from "@/utils/quizGenerator";

interface Subject {
  id: string;
  name: string;
}

export default function QuizTypePage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  const { user } = useAuth();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const createQuizSession = useQuizStore((state) => state.createQuizSession);
  const getNotesBySubject = useNotesStore((state) => state.getNotesBySubject);

  useEffect(() => {
    if (user && subjectId) {
      fetchSubject();
    }
  }, [user, subjectId]);

  const fetchSubject = async () => {
    if (!user || !subjectId) return;

    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("id", subjectId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching subject:", error);
        setSubject(null);
        return;
      }

      if (data) {
        setSubject({
          id: data.id,
          name: data.name,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setSubject(null);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // AuthProvider will redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Laster...</p>
          </div>
        </div>
      </div>
    );
  }

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
    } else if (type === "mcq_basic") {
      // Generate MCQ from notes
      const notes = getNotesBySubject(subjectId);
      
      if (notes.length === 0) {
        alert("Du må ha minst ett notat for dette faget for å generere quiz");
        return;
      }

      const questions = generateBasicMCQFromNotes(notes);
      
      if (questions.length === 0) {
        alert("Kunne ikke generere spørsmål fra notatene dine. Sjekk at notatene har innhold.");
        return;
      }

      const sessionId = createQuizSession(subjectId, "mcq_basic", questions);
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
              description="Test deg selv med flervalgsspørsmål generert fra notatene dine"
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
