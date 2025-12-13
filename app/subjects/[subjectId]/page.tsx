"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { usePlannerStore } from "@/store/usePlannerStore";
import { useStudyTrackerStore } from "@/store/useStudyTrackerStore";
import Oversikt from "@/components/subjects/Oversikt";
import { daysUntil } from "@/utils/date";

const IS_PRO_FEATURE = true;

interface Subject {
  id: string;
  name: string;
  examDate?: string;
}

export default function SubjectDetailPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const { user } = useAuth();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const plannerLiteData = usePlannerStore((state) => state.plannerLiteBySubjectId[subjectId]);
  const registerWorkedToday = useStudyTrackerStore((state) => state.registerWorkedToday);

  const examDate = subject?.examDate || plannerLiteData?.examDate;
  const daysToExam = examDate ? daysUntil(examDate) : null;

  // Register that user worked today when they visit a subject page
  useEffect(() => {
    registerWorkedToday();
  }, [registerWorkedToday]);

  useEffect(() => {
    if (user && subjectId) {
      fetchSubject();
    }
  }, [user, subjectId]);

  const fetchSubject = async () => {
    if (!user || !subjectId) return;

    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, exam_date")
        .eq("id", subjectId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching subject:", error);
        setSubject(null);
        return;
      }

      if (data) {
        setSubject({
          id: data.id,
          name: data.name,
          examDate: data.exam_date,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setSubject(null);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // AuthProvider will redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Laster...</p>
          </div>
        </div>
      </div>
    );
  }

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

          {/* Oversikt Section */}
          <div className="mb-6">
            <Oversikt subjectId={subjectId} initialExamDate={examDate} isPro={IS_PRO_FEATURE} />
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
