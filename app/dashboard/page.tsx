"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import SubjectCard from "@/components/SubjectCard";
import { useNotesStore } from "@/store/useNotesStore";
import { useSubjectsStore } from "@/store/useSubjectsStore";

export default function DashboardPage() {
  const { user } = useAuth();
  const subjects = useSubjectsStore((state) => state.subjects);
  const subjectsInitialized = useSubjectsStore((state) => state.initialized);
  const subjectsLoading = useSubjectsStore((state) => state.loading);
  const notes = useNotesStore((state) => state.notes);
  const notesInitialized = useNotesStore((state) => state.initialized);
  const notesLoading = useNotesStore((state) => state.loading);

  if (!user) {
    return null; // AuthProvider will redirect
  }

  const isLoading =
    subjectsLoading ||
    !subjectsInitialized ||
    notesLoading ||
    !notesInitialized;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <Link
              href="/subjects"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Nytt fag
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Laster...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Du har ingen fag ennå. Opprett ditt første fag for å komme i
                gang!
              </p>
              <Link
                href="/subjects"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Opprett fag
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => {
                const noteCount = notesInitialized
                  ? notes.filter((note) => note.subjectId === subject.id).length
                  : 0;

                return (
                  <SubjectCard
                    key={subject.id}
                    id={subject.id}
                    name={subject.name}
                    noteCount={noteCount}
                    examDate={subject.examDate}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
