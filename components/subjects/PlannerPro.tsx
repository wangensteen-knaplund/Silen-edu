"use client";

import { formatDateNO } from "@/utils/date";

interface PlannerProProps {
  subjectId: string;
  initialExamDate?: string;
}

export default function PlannerPro({ subjectId, initialExamDate }: PlannerProProps) {
  // Placeholder data
  const deadlines = [
    {
      id: "1",
      title: "Innlevering 1",
      dueDate: "2024-12-18",
      type: "assignment",
    },
    {
      id: "2",
      title: "Presentasjon",
      dueDate: "2024-12-19",
      type: "presentation",
    },
  ];

  const readingItems = [
    {
      id: "1",
      title: "Kapittel 1-3",
      progress: 75,
    },
    {
      id: "2",
      title: "Kapittel 4-6",
      progress: 30,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          ⭐ Planner Pro
        </h3>
        <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded">
          Pro Feature
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Pro-funksjoner inkluderer deadlines, lesefremgang og avansert planlegging.
      </p>

      {/* Deadlines Section */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          📌 Deadlines
        </h4>
        <div className="space-y-2">
          {deadlines.map((deadline) => (
            <div
              key={deadline.id}
              className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {deadline.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {formatDateNO(deadline.dueDate)}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded">
                  {deadline.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reading Items Section */}
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          📖 Lesefremgang
        </h4>
        <div className="space-y-3">
          {readingItems.map((item) => (
            <div key={item.id}>
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm text-gray-900 dark:text-white">
                  {item.title}
                </p>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
