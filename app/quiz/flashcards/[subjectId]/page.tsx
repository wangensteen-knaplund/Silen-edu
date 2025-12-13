"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSubjectsStore } from "@/store/useSubjectsStore";
import Flashcard from "@/components/quiz/Flashcard";

export default function FlashcardsPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;

  const subjects = useSubjectsStore((state) => state.subjects);
  const subject = subjects.find((s) => s.id === subjectId);

  // Dummy flashcards data
  const flashcards = [
    {
      id: "fc1",
      frontText: "Hva er derivasjon?",
      backText: "Derivasjon er et mål på hvor raskt en funksjon endrer seg",
    },
    {
      id: "fc2",
      frontText: "Hva er integrasjon?",
      backText: "Integrasjon er den motsatte operasjonen av derivasjon",
    },
    {
      id: "fc3",
      frontText: "Hva er en grenseverdi?",
      backText: "En grenseverdi beskriver verdien en funksjon nærmer seg",
    },
  ];

  const [currentCardIndex, setCurrentCardIndex] = useState(0);

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

  const currentCard = flashcards[currentCardIndex];

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link
              href={`/quiz/type/${subjectId}`}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-2 inline-block"
            >
              ← Tilbake til quiz-typer
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {subject.name} - Flashcards
            </h1>
          </div>

          <div className="mb-4 text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Kort {currentCardIndex + 1} av {flashcards.length}
            </span>
          </div>

          <div className="mb-6">
            <Flashcard
              frontText={currentCard.frontText}
              backText={currentCard.backText}
            />
          </div>

          <div className="flex justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentCardIndex === 0}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Forrige
            </button>
            <button
              onClick={handleNext}
              disabled={currentCardIndex === flashcards.length - 1}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Neste →
            </button>
          </div>

          {currentCardIndex === flashcards.length - 1 && (
            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Du har gått gjennom alle kortene!
              </p>
              <Link
                href={`/quiz/type/${subjectId}`}
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Tilbake til quiz-typer
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
