"use client";

import Link from "next/link";
import { useSubjectsStore } from "@/store/useSubjectsStore";

export default function QuizPage() {
  const subjects = useSubjectsStore((state) => state.subjects);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Quiz
          </h1>

          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Velg et fag
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Velg hvilket fag du vil teste deg i
            </p>
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Du har ingen fag ennå.
              </p>
              <Link
                href="/subjects"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Opprett fag
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/quiz/type/${subject.id}`}
                  className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Klikk for å velge quiz-type →
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
