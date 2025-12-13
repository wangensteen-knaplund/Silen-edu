"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSubjectsStore } from "@/store/useSubjectsStore";
import { usePlannerStore } from "@/store/usePlannerStore";
import PlannerLite from "@/components/subjects/PlannerLite";
import PlannerPro from "@/components/subjects/PlannerPro";
import { daysUntil } from "@/utils/date";

const IS_PRO_FEATURE = false;

export default function SubjectDetailPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;

  const subjects = useSubjectsStore((state) => state.subjects);
  const plannerLiteData = usePlannerStore((state) => state.plannerLiteBySubjectId[subjectId]);
  
  const subject = subjects.find((s) => s.id === subjectId);
  const examDate = subject?.examDate || plannerLiteData?.examDate;
  const daysToExam = examDate ? daysUntil(examDate) : null;

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Fag ikke funnet</p>
            <Link href="/subjects" className="text-blue-600 hover:underline mt-4 inline-block">
              Tilbake til fag
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

          {/* Planner Section */}
          <div className="mb-6 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Planlegging
            </h2>
            <PlannerLite subjectId={subjectId} initialExamDate={examDate} />
            
            {IS_PRO_FEATURE && (
              <PlannerPro subjectId={subjectId} initialExamDate={examDate} />
            )}
            
            {!IS_PRO_FEATURE && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  ⭐ Planner Pro (Kommer snart)
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Planner Pro gir deg tilgang til deadlines, lesefremgang og avansert planlegging.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
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
