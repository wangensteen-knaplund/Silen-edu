"use client";

import Link from "next/link";
import { useSubjectsStore } from "@/store/useSubjectsStore";
import { useStudyTrackerStore } from "@/store/useStudyTrackerStore";
import StudyHeatmapStrip from "@/components/dashboard/StudyHeatmapStrip";

export default function Dashboard() {
  const subjects = useSubjectsStore((state) => state.subjects);
  const getWeeklyIntensities = useStudyTrackerStore((state) => state.getWeeklyIntensities);
  const intensities = getWeeklyIntensities();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Greeting Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Velkommen, bruker. Hva vil du gjøre i dag?
            </h1>
          </div>

          {/* Weekly Study Tracker Section */}
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Ukentlig studieaktivitet
            </h2>
            <StudyHeatmapStrip intensities={intensities} />
          </div>

          {/* Subjects Overview Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Mine fag
              </h2>
              <Link
                href="/subjects"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Se alle →
              </Link>
            </div>
            {subjects.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                Ingen fag lagt til ennå.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.slice(0, 6).map((subject) => (
                  <Link
                    key={subject.id}
                    href={`/subjects/${subject.id}`}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {subject.name}
                    </h3>
                    {subject.examDate && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Eksamen: {subject.examDate}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
