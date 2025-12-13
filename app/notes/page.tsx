"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useNotesStore } from "@/store/useNotesStore";
import { useSubjectsStore } from "@/store/useSubjectsStore";

export default function NotesPage() {
  const searchParams = useSearchParams();
  const subjectIdFilter = searchParams.get("subjectId");

  const notes = useNotesStore((state) => state.notes);
  const notesInitialized = useNotesStore((state) => state.initialized);
  const notesLoading = useNotesStore((state) => state.loading);
  const getNotesBySubject = useNotesStore((state) => state.getBySubject);

  const subjects = useSubjectsStore((state) => state.subjects);
  const subjectsInitialized = useSubjectsStore((state) => state.initialized);
  const subjectsLoading = useSubjectsStore((state) => state.loading);

  const visibleNotes = subjectIdFilter
    ? getNotesBySubject(subjectIdFilter)
    : notes;

  const isLoading =
    notesLoading ||
    !notesInitialized ||
    subjectsLoading ||
    !subjectsInitialized;

  const getTitleFromContent = (content: string, fallback?: string) => {
    if (fallback?.trim()) return fallback;

    const firstLine = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0);

    return firstLine || "Uten tittel";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto py-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">Laster notater…</p>
        </div>
      </div>
    );
  }

  if (visibleNotes.length === 0) {
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
          {visibleNotes.map((note) => {
            const subject = subjects.find((s) => s.id === note.subjectId);

            return (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getTitleFromContent(note.content, note.title)}
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
