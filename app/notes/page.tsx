"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useNotesStore } from "@/store/useNotesStore";
import { useSubjectsStore } from "@/store/useSubjectsStore";

export default function NotesPage() {
  const searchParams = useSearchParams();
  const subjectIdFilter = searchParams.get("subjectId");

  const hydrationStatus = useAppStore((state) => state.hydrationStatus);
  const appError = useAppStore((state) => state.error);

  const notes = useNotesStore((state) => state.notes);
  const notesInitialized = useNotesStore((state) => state.initialized);
  const notesLoading = useNotesStore((state) => state.loading);
  const notesError = useNotesStore((state) => state.error);
  const getNotesBySubject = useNotesStore((state) => state.getBySubject);

  const subjects = useSubjectsStore((state) => state.subjects);
  const subjectsInitialized = useSubjectsStore((state) => state.initialized);
  const subjectsLoading = useSubjectsStore((state) => state.loading);
  const subjectsError = useSubjectsStore((state) => state.error);

  const visibleNotes = subjectIdFilter
    ? getNotesBySubject(subjectIdFilter)
    : notes;

  const isLoading =
    hydrationStatus !== "ready" ||
    notesLoading ||
    !notesInitialized ||
    subjectsLoading ||
    !subjectsInitialized;

  const errorMessage = appError || notesError || subjectsError;

  const getTitle = (title: string, content: string) => {
    if (title && title.trim().length > 0) return title;
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

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto py-12 text-center">
          <p className="text-red-700 bg-red-100 inline-block px-4 py-2 rounded">
            {errorMessage}
          </p>
        </div>
      </div>
    );
  }

  if (visibleNotes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">Ingen notater funnet</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/notes/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lag nytt notat
            </Link>
            <Link
              href="/subjects"
              className="px-4 py-2 text-blue-600 hover:underline"
            >
              Gå til fag
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notater</h1>
          <Link
            href="/notes/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Nytt notat
          </Link>
        </div>

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
                  {getTitle(note.title, note.content)}
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
