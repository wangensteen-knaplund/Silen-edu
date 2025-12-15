"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import SubjectCard from "@/components/SubjectCard";
import { useSubjectsStore } from "@/store/useSubjectsStore";
import { useCurriculumStore } from "@/store/useCurriculumStore";
import { useStudyActivityStore } from "@/store/useStudyActivityStore";

export default function DashboardPage() {
  const { user } = useAuth();
  const subjects = useSubjectsStore((state) => state.subjects);
  const subjectsInitialized = useSubjectsStore((state) => state.initialized);
  const subjectsLoading = useSubjectsStore((state) => state.loading);
  
  const curriculumData = useCurriculumStore((state) => state.dataBySubjectId);
  const loadCurriculumForSubject = useCurriculumStore((state) => state.loadForSubject);
  
  const lastActivityBySubject = useStudyActivityStore((state) => state.lastActivityBySubject);
  const loadLastActivityForAllSubjects = useStudyActivityStore(
    (state) => state.loadLastActivityForAllSubjects
  );

  // Load curriculum data for all subjects
  useEffect(() => {
    if (!user || !subjectsInitialized || subjects.length === 0) return;

    subjects.forEach((subject) => {
      const existing = curriculumData[subject.id];
      if (!existing?.initialized && !existing?.loading) {
        loadCurriculumForSubject(subject.id, user.id).catch((err) => {
          console.error(`Error loading curriculum for subject ${subject.id}:`, err);
        });
      }
    });
  }, [user, subjects, subjectsInitialized, curriculumData, loadCurriculumForSubject]);

  // Load study activity for all subjects
  useEffect(() => {
    if (!user || !subjectsInitialized || subjects.length === 0) return;
    
    const subjectIds = subjects.map((s) => s.id);
    loadLastActivityForAllSubjects(user.id, subjectIds).catch((err) => {
      console.error("Error loading study activities:", err);
    });
  }, [user, subjects, subjectsInitialized, loadLastActivityForAllSubjects]);

  // Calculate data for each subject card
  const subjectCardsData = useMemo(() => {
    return subjects.map((subject) => {
      // Get curriculum items for this subject with defensive checks
      const curriculumState = curriculumData[subject.id];
      const curriculumItems = curriculumState?.items || [];
      const curriculumTotal = curriculumItems.length;
      const curriculumCompleted = curriculumItems.filter(
        (item) => item?.completed
      ).length;

      // Get last activity date with defensive check
      const lastActivityDate = lastActivityBySubject[subject.id];

      return {
        subject,
        curriculumTotal: curriculumTotal || 0,
        curriculumCompleted: curriculumCompleted || 0,
        lastActivityDate: lastActivityDate
          ? lastActivityDate.split("T")[0]
          : undefined,
      };
    });
  }, [subjects, curriculumData, lastActivityBySubject]);

  if (!user) {
    return null; // AuthProvider will redirect
  }

  const isLoading =
    subjectsLoading ||
    !subjectsInitialized;

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
                  curriculumTotal,
                  curriculumCompleted,
                  lastActivityDate,
                }) => (
                  <SubjectCard
                    key={subject.id}
                    id={subject.id}
                    name={subject.name}
                    examDate={subject.examDate}
                    curriculumTotal={curriculumTotal}
                    curriculumCompleted={curriculumCompleted}
                    lastActivityDate={lastActivityDate}
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
