"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import SubjectCard from "@/components/SubjectCard";
import { useAppStore } from "@/store/useAppStore";
import { useSubjectsStore } from "@/store/useSubjectsStore";
import { useCurriculumStore } from "@/store/useCurriculumStore";
import { useStudyActivityStore } from "@/store/useStudyActivityStore";

export default function SubjectsPage() {
  const { user } = useAuth();
  const hydrationStatus = useAppStore((state) => state.hydrationStatus);
  const appError = useAppStore((state) => state.error);

  const subjects = useSubjectsStore((state) => state.subjects);
  const loading = useSubjectsStore((state) => state.loading);
  const initialized = useSubjectsStore((state) => state.initialized);
  const subjectError = useSubjectsStore((state) => state.error);
  const createSubject = useSubjectsStore((state) => state.createSubject);

  // Curriculum & study activity stores
  const curriculumData = useCurriculumStore((state) => state.dataBySubjectId);
  const loadCurriculumForSubject = useCurriculumStore((state) => state.loadForSubject);

  const lastActivityBySubject = useStudyActivityStore((state) => state.lastActivityBySubject);
  const loadLastActivityForAllSubjects = useStudyActivityStore((state) => state.loadLastActivityForAllSubjects);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectSemester, setNewSubjectSemester] = useState("");
  const [newSubjectExamDate, setNewSubjectExamDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Create subject handler
  const handleAddSubject = async () => {
    setCreateError(null);

    if (!newSubjectName.trim()) {
      setCreateError("Vennligst skriv inn et fagnavn");
      return;
    }

    if (!user) {
      setCreateError("Du må være innlogget for å legge til fag");
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await createSubject({
        userId: user.id,
        name: newSubjectName.trim(),
        semester: newSubjectSemester.trim() || undefined,
        examDate: newSubjectExamDate || undefined,
      });

      if (created) {
        setNewSubjectName("");
        setNewSubjectSemester("");
        setNewSubjectExamDate("");
        setShowAddForm(false);
        setCreateError(null);
      } else {
        setCreateError("Kunne ikke legge til fag. Prøv igjen.");
      }
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error("Error creating subject:", error);
      setCreateError(error?.message ?? "Kunne ikke legge til fag. Prøv igjen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null; // AuthProvider will redirect
  }

  // Interpret hydrationStatus safely
  const isHydrating = hydrationStatus !== "ready" && hydrationStatus !== "error";
  const isLoading = isHydrating || loading || !initialized;

  // Consolidated error message (store-level + local create error)
  const errorMessage = createError ?? appError ?? subjectError ?? (hydrationStatus === "error" ? "Problemer ved initiering" : null);

  // Load curriculum for each subject (if missing) — same pattern as Dashboard
  useEffect(() => {
    if (!user || !initialized || subjects.length === 0) return;

    subjects.forEach((subject) => {
      const existing = curriculumData[subject.id];
      if (!existing?.initialized && !existing?.loading) {
        loadCurriculumForSubject(subject.id, user.id).catch((err) => {
          // eslint-disable-next-line no-console
          console.error(`Error loading curriculum for subject ${subject.id}:`, err);
        });
      }
    });
  }, [user, subjects, initialized, curriculumData, loadCurriculumForSubject]);

  // Load last activity for all subjects (bulk)
  useEffect(() => {
    if (!user || !initialized || subjects.length === 0) return;

    const subjectIds = subjects.map((s) => String(s.id));
    loadLastActivityForAllSubjects(user.id, subjectIds).catch((err) => {
      // eslint-disable-next-line no-console
      console.error("Error loading study activities:", err);
    });
  }, [user, subjects, initialized, loadLastActivityForAllSubjects]);

  // Compute derived data per subject defensively
  const subjectCardsData = useMemo(() => {
    return subjects.map((subject) => {
      const curriculumState = curriculumData[subject.id];
      const curriculumItems = Array.isArray(curriculumState?.items) ? curriculumState.items : [];
      const curriculumTotal = curriculumItems.length;
      const curriculumCompleted = curriculumItems.filter((item) => !!item?.completed).length;

      // Get last activity date safely — only split if string
      const rawLastActivity = lastActivityBySubject[subject.id];
      const lastActivityDate = typeof rawLastActivity === "string" ? rawLastActivity.split("T")[0] : undefined;

      return {
        subject,
        curriculumTotal,
        curriculumCompleted,
        lastActivityDate,
      };
    });
  }, [subjects, curriculumData, lastActivityBySubject]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mine fag</h1>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setCreateError(null);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {showAddForm ? "Avbryt" : "+ Nytt fag"}
            </button>
          </div>

          {showAddForm && (
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Legg til nytt fag</h2>

              {createError && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-200">
                  {String(createError)}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Fagnavn *</label>
                  <input
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="F.eks. Matematikk 1"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Semester (valgfritt)</label>
                  <input
                    type="text"
                    value={newSubjectSemester}
                    onChange={(e) => setNewSubjectSemester(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="F.eks. Høst 2024"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Eksamensdato (valgfritt)</label>
                  <input
                    type="date"
                    value={newSubjectExamDate}
                    onChange={(e) => setNewSubjectExamDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddSubject}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    {isSubmitting ? "Legger til..." : "Legg til fag"}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewSubjectName("");
                      setNewSubjectSemester("");
                      setNewSubjectExamDate("");
                      setCreateError(null);
                    }}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg border border-red-200">
              {String(errorMessage)}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="text-gray-600 dark:text-gray-400">Laster...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="text-gray-600 dark:text-gray-400">Du har ingen fag ennå. Fag vil bli lagt til her.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjectCardsData.map(
                ({ subject, curriculumTotal, curriculumCompleted, lastActivityDate }) => (
                  <SubjectCard
                    key={String(subject.id)}
                    id={String(subject.id)}
                    name={String(subject.name ?? "Uten navn")}
                    examDate={typeof (subject as any).examDate === "string" ? (subject as any).examDate : undefined}
                    curriculumTotal={Number(curriculumTotal ?? 0)}
                    curriculumCompleted={Number(curriculumCompleted ?? 0)}
                    lastActivityDate={typeof lastActivityDate === "string" ? lastActivityDate : null}
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
