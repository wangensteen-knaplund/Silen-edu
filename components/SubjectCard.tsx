"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { daysUntil, formatLastWorked } from "@/utils/date";

interface SubjectCardProps {
  id: string;
  name: string;
  examDate?: string;
  readingItemsTotal: number;
  readingItemsCompleted: number;
  lastWorkedDate?: string;
}

export default function SubjectCard({
  id,
  name,
  examDate,
  readingItemsTotal,
  readingItemsCompleted,
  lastWorkedDate,
}: SubjectCardProps) {
  const router = useRouter();
  const daysToExam = examDate ? daysUntil(examDate) : null;

  // Calculate progress percentage
  const progressPercent =
    readingItemsTotal > 0
      ? Math.round((readingItemsCompleted / readingItemsTotal) * 100)
      : 0;

  const handleQuickNote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/notes/new?subjectId=${id}`);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if not clicking on the button
    const target = e.target as HTMLElement;
    if (target?.closest && target.closest("button")) {
      return;
    }
    router.push(`/subjects/${id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 cursor-pointer"
    >
      {/* Subject Name */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {name}
        </h3>
        <button
          onClick={handleQuickNote}
          className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          + Notat
        </button>
      </div>

      {/* Exam Countdown */}
      {daysToExam !== null && (
        <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
          {daysToExam > 0
            ? `${daysToExam} dager til eksamen`
            : daysToExam === 0
            ? "Eksamen i dag"
            : "Eksamen er over"}
        </p>
      )}

      {/* Curriculum Progress */}
      {readingItemsTotal === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Ingen pensum lagt til enda
        </p>
      ) : (
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Pensum</span>
            <span>
              {readingItemsCompleted === 0 && readingItemsTotal > 0
                ? "Ikke startet"
                : `${progressPercent} %`}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Last Worked */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {formatLastWorked(lastWorkedDate)}
      </p>
    </div>
  );
}
