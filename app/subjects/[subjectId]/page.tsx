"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import Oversikt from "@/components/subjects/Oversikt";
import { useAppStore } from "@/store/useAppStore";
import { usePlannerStore } from "@/store/usePlannerStore";
import { useStudyTrackerStore } from "@/store/useStudyTrackerStore";
import { useSubjectsStore } from "@/store/useSubjectsStore";
import { daysUntil } from "@/utils/date";

const IS_PRO_FEATURE = true;

export default function SubjectDetailPage() {
  const params = useParams();
  const subjectId = (params as { subjectId?: string })?.subjectId;

  const { user } = useAuth();

  const hydrationStatus = useAppStore((state) => state.hydrationStatus);
  const appError = useAppStore((state) => state.error);

  const subjects = useSubjectsStore((state) => state.subjects);

  const plannerState = usePlannerStore((state) => state.dataBySubjectId[subjectId ?? ""]);
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
    if (!user || hydrationStatus !== "ready" || !subject || !subjectId) return;
    void loadPlanner(subjectId, user.id);
  }, [user, subjectId, hydrationStatus, subjects, subject, plannerState, loadPlanner]);

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
      <Oversikt subject={subject} isPro={IS_PRO_FEATURE} />
    </div>
  );
}
