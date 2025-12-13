"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSubjectsStore } from "@/store/useSubjectsStore";
import { useQuizStore } from "@/store/useQuizStore";
import Flashcard from "@/components/quiz/Flashcard";
import { nanoid } from "nanoid";

export default function FlashcardsPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;

  const subjects = useSubjectsStore((state) => state.subjects);
  const getFlashcardsBySubject = useQuizStore((state) => state.getFlashcardsBySubject);
  const addFlashcard = useQuizStore((state) => state.addFlashcard);
  const removeFlashcard = useQuizStore((state) => state.removeFlashcard);
  
  const subject = subjects.find((s) => s.id === subjectId);
  const flashcards = getFlashcardsBySubject(subjectId);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");

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

  const handleAddFlashcard = () => {
    if (!frontText.trim() || !backText.trim()) {
      alert("Vennligst fyll ut både forside og bakside");
      return;
    }

    addFlashcard({
      id: nanoid(),
      subjectId,
      front: frontText.trim(),
      back: backText.trim(),
    });

    setFrontText("");
    setBackText("");
    setShowAddForm(false);
  };

  const handleDeleteCurrent = () => {
    if (flashcards.length > 0 && confirm("Er du sikker på at du vil slette dette kortet?")) {
      const currentCard = flashcards[currentCardIndex];
      removeFlashcard(subjectId, currentCard.id);
      if (currentCardIndex >= flashcards.length - 1 && currentCardIndex > 0) {
        setCurrentCardIndex(currentCardIndex - 1);
      }
    }
  };

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
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {subject.name} - Flashcards
              </h1>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {showAddForm ? "Avbryt" : "+ Legg til kort"}
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Legg til nytt flashcard
              </h3>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Forside (spørsmål)
                </label>
                <input
                  type="text"
                  value={frontText}
                  onChange={(e) => setFrontText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="F.eks. Hva er derivasjon?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Bakside (svar)
                </label>
                <textarea
                  value={backText}
                  onChange={(e) => setBackText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24"
                  placeholder="F.eks. Derivasjon er et mål på hvor raskt en funksjon endrer seg"
                />
              </div>
              <button
                onClick={handleAddFlashcard}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Legg til kort
              </button>
            </div>
          )}

          {flashcards.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Ingen flashcards lagt til ennå
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Legg til ditt første kort
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Kort {currentCardIndex + 1} av {flashcards.length}
                </span>
                <button
                  onClick={handleDeleteCurrent}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Slett kort
                </button>
              </div>

              <div className="mb-6">
                <Flashcard
                  frontText={currentCard.front}
                  backText={currentCard.back}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
