"use client";

import Link from "next/link";
import { formatDateNO } from "@/utils/date";

interface NoteCardProps {
  id: string;
  content: string;
  subjectName?: string;
  createdAt: string;
}

export default function NoteCard({ id, content, subjectName, createdAt }: NoteCardProps) {
  const title = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0) || "Uten tittel";

  return (
    <Link href={`/notes/${id}`}>
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 cursor-pointer">
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          {title}
        </h3>
        {subjectName && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
            {subjectName}
          </p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {content}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {formatDateNO(createdAt)}
        </p>
      </div>
    </Link>
  );
}
