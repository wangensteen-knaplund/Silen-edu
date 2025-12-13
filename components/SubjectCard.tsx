"use client";

import Link from "next/link";
import { daysUntil } from "@/utils/date";

interface SubjectCardProps {
  id: string;
  name: string;
  noteCount?: number;
  examDate?: string;
}

export default function SubjectCard({
  id,
  name,
  noteCount = 0,
  examDate,
}: SubjectCardProps) {
  const daysToExam = examDate ? daysUntil(examDate) : null;

  return (
    <Link href={`/subjects/${id}`}>
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 cursor-pointer">
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          {name}
        </h3>
        {daysToExam !== null && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
            {daysToExam > 0
              ? `${daysToExam} dager til eksamen`
              : daysToExam === 0
              ? "Eksamen i dag!"
              : "Eksamen er over"}
          </p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {noteCount} {noteCount === 1 ? "notat" : "notater"}
        </p>
      </div>
    </Link>
  );
}
