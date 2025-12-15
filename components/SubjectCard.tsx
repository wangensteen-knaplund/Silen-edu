"use client";

import { useRouter } from "next/navigation";
import { daysUntil, formatLastWorked } from "@/utils/date";

interface SubjectCardProps {
  id: string;
  name: string;
  examDate?: string | null;
  curriculumTotal?: number | null;
  curriculumCompleted?: number | null;
  lastActivityDate?: string | null;
}

export default function SubjectCard({
  id,
  name,
  examDate = null,
  curriculumTotal = 0,
  curriculumCompleted = 0,
  lastActivityDate = null,
}: SubjectCardProps) {
  const router = useRouter();

  // Defensive parsing of numbers to avoid NaN / negative or non-number values
  const safeTotal = Math.max(0, Number(curriculumTotal) || 0);
  const safeCompleted = Math.max(0, Number(curriculumCompleted) || 0);

  // Calculate progress percentage safely
  const rawPercent =
    safeTotal > 0 ? Math.round((safeCompleted / safeTotal) * 100) : 0;
  const progressPercent = Number.isFinite(rawPercent)
    ? Math.min(100, Math.max(0, rawPercent))
    : 0;

  // Compute days to exam defensively
  let daysToExam: number | null = null;
  if (examDate) {
    try {
      const d = daysUntil(examDate);
      daysToExam = typeof d === "number" && !Number.isNaN(d) ? d : null;
    } catch {
      daysToExam = null;
    }
  }

  const handleQuickNote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/notes/new?subjectId=${encodeURIComponent(id)}`);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if not clicking on the button
    const target = e.target as HTMLElement | null;
    if (target?.closest && target.closest("button")) {
      return;
    }
    router.push(`/subjects/${id}`);
  };

  const lastStudiedText =
    lastActivityDate && typeof lastActivityDate === "string"
      ? formatLastWorked(lastActivityDate)
      : "Ingen aktivitet";

  return (
    <div
      onClick={handleCardClick}
      className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 cursor-pointer"
    >
      {/* Subject Name */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {String(name ?? "Uten navn")}
        </h3>
        <button
          onClick={handleQuickNote}
          className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label={`Legg til notat for ${name}`}
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
      {safeTotal === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Ingen pensum lagt til enda
        </p>
      ) : (
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Pensum</span>
            <span>
              {safeCompleted === 0 && safeTotal > 0 ? "Ikke startet" : `${progressPercent} %`}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {/* Last Studied */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Sist jobbet: {lastStudiedText}
      </p>
    </div>
  );
}
