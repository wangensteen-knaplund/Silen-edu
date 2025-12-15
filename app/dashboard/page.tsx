"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import SubjectCard from "@/components/SubjectCard";
import { useNotesStore } from "@/store/useNotesStore";
import { useSubjectsStore } from "@/store/useSubjectsStore";
import { usePlannerStore } from "@/store/usePlannerStore";

export default function DashboardPage() {
  const { user } = useAuth();
  const subjects = useSubjectsStore((state) => state.subjects);
  const subjectsInitialized = useSubjectsStore((state) => state.initialized);
  const subjectsLoading = useSubjectsStore((state) => state.loading);
  const notes = useNotesStore((state) => state.notes);
  const notesInitialized = useNotesStore((state) => state.initialized);
  const notesLoading = useNotesStore((state) => state.loading);
  const plannerData = usePlannerStore((state) => state.dataBySubjectId);
  const loadForSubject = usePlannerStore((state) => state.loadForSubject);

  // Load planner data for all subjects
  useEffect(() => {
    if (!user || !subjectsInitialized || subjects.length === 0) return;

    subjects.forEach((subject) => {
      const existing = plannerData[subject.id];
      if (!existing?.initialized && !existing?.loading) {
        loadForSubject(subject.id, user.id).catch((err) => {
          console.error(`Error loading planner for subject ${subject.id}:`, err);
        });
      }
    });
  }, [user, subjects, subjectsInitialized, plannerData, loadForSubject]);

  // Calculate data for each subject card
  const subjectCardsData = useMemo(() => {
    return subjects.map((subject) => {
      // Get reading items for this subject
      const plannerState = plannerData[subject.id];
      const readingItems = plannerState?.readingItems || [];
      const readingItemsTotal = readingItems.length;
      const readingItemsCompleted = readingItems.filter(
        (item) => item.completed
      ).length;

      // Find last worked date from notes
      const subjectNotes = notes.filter(
        (note) => note.subjectId === subject.id
      );
      const lastWorkedDate =
        subjectNotes.length > 0
          ? subjectNotes.reduce((latest, note) => {
              const noteDate = new Date(note.updatedAt || note.createdAt);
              const latestDate = latest ? new Date(latest) : new Date(0);
              return noteDate > latestDate
                ? note.updatedAt || note.createdAt
                : latest;
            }, "" as string)
          : undefined;

      return {
        subject,
        readingItemsTotal,
        readingItemsCompleted,
        lastWorkedDate: lastWorkedDate
          ? lastWorkedDate.split("T")[0]
          : undefined,
      };
    });
  }, [subjects, plannerData, notes]);

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
              {subjectCardsData.map(
                ({
                  subject,
                  readingItemsTotal,
                  readingItemsCompleted,
                  lastWorkedDate,
                }) => (
                  <SubjectCard
                    key={subject.id}
                    id={subject.id}
                    name={subject.name}
                    examDate={subject.examDate}
                    readingItemsTotal={readingItemsTotal}
                    readingItemsCompleted={readingItemsCompleted}
                    lastWorkedDate={lastWorkedDate}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
