"use client";

useEffect(() => {
  console.log("DEBUG: SubjectDetailPage", {
    user,
    subjectId,
    hydrationStatus,
    subjectsLength: subjects?.length,
    subjectFound: !!subject,
    plannerState,
  });
}, [user, subjectId, hydrationStatus, subjects, subject, plannerState]);

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import Oversikt from "@/components/subjects/Oversikt";
import { useAppStore } from "@/store/useAppStore";
import { usePlannerStore } from "@/store/usePlannerStore";
import { useStudyTrackerStore } from "@/store/useStudyTrackerStore";
import { useSubjectsStore } from "@/store/useSubjectsStore";
import { daysUntil } from "@/utils/date";

const IS_PRO_FEATURE = true;

interface SubjectDetailPageProps {
  params: {
    subjectId: string;
  };
}

export default function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const { user } = useAuth();
  const subjectId = params.subjectId;

  const hydrationStatus = useAppStore((state) => state.hydrationStatus);
  const appError = useAppStore((state) => state.error);

  const subjects = useSubjectsStore((state) => state.subjects);

  const plannerState = usePlannerStore((state) => state.dataBySubjectId[subjectId]);
  const loadPlanner = usePlannerStore((state) => state.loadForSubject);

  const registerWorkedToday = useStudyTrackerStore(
    (state) => state.registerWorkedToday
  );

  useEffect(() => {
    registerWorkedToday();
  }, [registerWorkedToday]);

  const subject = useMemo(
    () => subjects.find((s) => s.id === subjectId),
    [subjects, subjectId]
  );

  useEffect(() => {
    if (!user || hydrationStatus !== "ready" || !subject) return;
    void loadPlanner(subjectId, user.id);
  }, [user, hydrationStatus, subjectId, subject, loadPlanner]);

  if (!user) {
    return null;
  }

  if (appError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 text-center">
          <p className="text-red-700 bg-red-100 inline-block px-4 py-2 rounded">
            {appError}
          </p>
        </div>
      </div>
    );
  }

  const plannerLoading = plannerState?.loading;
  const plannerInitialized = plannerState?.initialized;
  const plannerError = plannerState?.error;

  const isLoading =
    hydrationStatus !== "ready" ||
    !subject ||
    plannerLoading ||
    !plannerInitialized;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">Laster fag…</p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">Fag ikke funnet</p>
          <Link
            href="/subjects"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            Tilbake til fag
          </Link>
        </div>
      </div>
    );
  }

  const examDate = subject.examDate;
  const daysToExam = examDate ? daysUntil(examDate) : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link
              href="/subjects"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-2 inline-block"
            >
              ← Tilbake til fag
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {subject.name}
            </h1>

            {daysToExam !== null && (
              <p className="text-lg text-blue-600 dark:text-blue-400 mt-2">
                {daysToExam > 0
                  ? `${daysToExam} dager til eksamen`
                  : daysToExam === 0
                  ? "Eksamen i dag!"
                  : "Eksamen er over"}
              </p>
            )}
          </div>

          {plannerError && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg border border-red-200">
              {plannerError}
            </div>
          )}

          <div className="mb-6">
            <Oversikt subject={subject} isPro={IS_PRO_FEATURE} />
          </div>

          <div className="flex gap-4 mb-6">
            <Link
              href={`/notes?subjectId=${subjectId}`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Åpne notater for faget
            </Link>

            <Link
              href={`/quiz/type/${subjectId}`}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Start quiz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
