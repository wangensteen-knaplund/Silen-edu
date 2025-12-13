"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuizStore } from "@/store/useQuizStore";
import { useStudyTrackerStore } from "@/store/useStudyTrackerStore";

export default function QuizSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const getSessionById = useQuizStore((state) => state.getSessionById);
  const session = getSessionById(sessionId);
  const registerQuizTaken = useStudyTrackerStore((state) => state.registerQuizTaken);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Quiz-sesjon ikke funnet</p>
            <Link href="/quiz" className="text-blue-600 hover:underline mt-4 inline-block">
              Tilbake til quiz
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === session.questions.length - 1;

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (!selectedAnswer) {
      alert("Vennligst velg et svar");
      return;
    }

    // Check if answer is correct
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }

    if (isLastQuestion) {
      setShowResult(true);
      // Register quiz completion only once
      if (!quizCompleted) {
        registerQuizTaken();
        setQuizCompleted(true);
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    }
  };

  if (showResult) {
    const percentage = Math.round((score / session.questions.length) * 100);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Quiz fullført!
              </h1>
              <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                {percentage}%
              </div>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
                Du fikk {score} av {session.questions.length} riktig
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href={`/quiz/type/${session.subjectId}`}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Ta en ny quiz
                </Link>
                <Link
                  href="/quiz"
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Tilbake til quiz
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-4 flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Spørsmål {currentQuestionIndex + 1} av {session.questions.length}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Poeng: {score}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3 mb-8">
              {currentQuestion.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                    selectedAnswer === option
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <span className="text-gray-900 dark:text-white">{option}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={!selectedAnswer}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLastQuestion ? "Fullfør" : "Neste"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
