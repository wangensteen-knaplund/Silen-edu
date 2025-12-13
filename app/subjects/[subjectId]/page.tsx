"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import Oversikt from "@/components/subjects/Oversikt";
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

  const subjects = useSubjectsStore((state) => state.subjects);
  const loading = useSubjectsStore((state) => state.loading);
  const ensureSubjectsLoaded = useSubjectsStore(
    (state) => state.ensureSubjectsLoaded
  );

  const plannerLiteData = usePlannerStore(
    (state) => state.plannerLiteBySubjectId[subjectId]
  );

  const registerWorkedToday = useStudyTrackerStore(
    (state) => state.registerWorkedToday
  );

  // Sørg for at fag lastes
  useEffect(() => {
    if (user) {
      ensureSubjectsLoaded(user.id);
    }
  }, [user, ensureSubjectsLoaded]);

  // Marker studiedag
  useEffect(() => {
    registerWorkedToday();
  }, [registerWorkedToday]);

  // Vent på auth
  if (!user) {
    return null;
  }

  // Vent på data
  if (loading || subjects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">Laster fag…</p>
        </div>
      </div>
    );
  }

  const subject = subjects.find((s) => s.id === subjectId);

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

  const examDate = subject.examDate || plannerLiteData?.examDate;
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

          <div className="mb-6">
            <Oversikt
              subjectId={subjectId}
              initialExamDate={examDate}
              isPro={IS_PRO_FEATURE}
            />
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
