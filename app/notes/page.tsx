"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useNotesStore } from "@/store/useNotesStore";
import { useSubjectsStore } from "@/store/useSubjectsStore";

export default function NotesPage() {
  const searchParams = useSearchParams();
  const subjectIdFilter = searchParams.get("subjectId");

  const notesBySubjectId = useNotesStore((state) => state.notesBySubjectId);
  const subjects = useSubjectsStore((state) => state.subjects);

  // Finn hvilke fag vi skal vise notater for
  const subjectIds = subjectIdFilter
    ? [subjectIdFilter]
    : Object.keys(notesBySubjectId);

  // Flatt ut notater
  const notes = subjectIds.flatMap(
    (subjectId) => notesBySubjectId[subjectId] ?? []
  );

  if (notes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto py-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Ingen notater funnet
          </p>
          <Link
            href="/subjects"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            Gå til fag
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Notater
        </h1>

        <div className="space-y-4">
          {notes.map((note) => {
            const subject = subjects.find((s) => s.id === note.subjectId);

            return (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {note.title || "Uten tittel"}
                </h2>
                {subject && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subject.name}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
