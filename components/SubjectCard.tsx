"use client";

import Link from "next/link";

interface SubjectCardProps {
  id: string;
  name: string;
  noteCount?: number;
}

export default function SubjectCard({
  id,
  name,
  noteCount = 0,
}: SubjectCardProps) {
  return (
    <Link href={`/subjects/${id}`}>
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 cursor-pointer">
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          {name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {noteCount} {noteCount === 1 ? "notat" : "notater"}
        </p>
      </div>
    </Link>
  );
}
