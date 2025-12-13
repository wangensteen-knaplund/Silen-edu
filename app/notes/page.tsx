"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import NoteCard from "@/components/notes/NoteCard";
import { useNotesStore } from "@/store/useNotesStore";
import { useSubjectsStore } from "@/store/useSubjectsStore";

function NotesContent() {
  const searchParams = useSearchParams();
  const subjectIdFilter = searchParams.get("subjectId");

  const notes = useNotesStore((state) => state.notes);
  const subjects = useSubjectsStore((state) => state.subjects);

  // Filter notes by subject if filter is active
  const filteredNotes = subjectIdFilter
    ? notes.filter((note) => note.subjectId === subjectIdFilter)
    : notes;

  // Get subject name for each note
  const notesWithSubject = filteredNotes.map((note) => ({
    ...note,
    subjectName: subjects.find((s) => s.id === note.subjectId)?.name || "Ukjent fag",
  }));

  return (
    <>
      {/* Filters */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Filtrer etter fag
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={subjectIdFilter || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value) {
                  window.location.href = `/notes?subjectId=${value}`;
                } else {
                  window.location.href = "/notes";
                }
              }}
            >
              <option value="">Alle fag</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Filtrer etter tag (Placeholder)
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              disabled
            >
              <option>Alle tags</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes List */}
      {notesWithSubject.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {subjectIdFilter
              ? "Ingen notater funnet for dette faget."
              : "Du har ingen notater ennå."}
          </p>
          <Link
            href="/notes/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Opprett ditt første notat
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notesWithSubject.map((note) => (
            <NoteCard
              key={note.id}
              id={note.id}
              title={note.title}
              content={note.content}
              subjectName={note.subjectName}
              createdAt={note.createdAt}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function NotesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Notater
            </h1>
            <Link
              href="/notes/new"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Nytt notat
            </Link>
          </div>

          <Suspense fallback={<div className="text-center py-12">Laster...</div>}>
            <NotesContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
