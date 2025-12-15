"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import SubjectCard from "@/components/SubjectCard";
import { useAppStore } from "@/store/useAppStore";
import { useSubjectsStore } from "@/store/useSubjectsStore";

export default function SubjectsPage() {
  const { user } = useAuth();
  const hydrationStatus = useAppStore((state) => state.hydrationStatus);
  const appError = useAppStore((state) => state.error);

  const subjects = useSubjectsStore((state) => state.subjects);
  const loading = useSubjectsStore((state) => state.loading);
  const initialized = useSubjectsStore((state) => state.initialized);
  const subjectError = useSubjectsStore((state) => state.error);
  const createSubject = useSubjectsStore((state) => state.createSubject);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectSemester, setNewSubjectSemester] = useState("");
  const [newSubjectExamDate, setNewSubjectExamDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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
      // keep error message user-friendly, but log full error for devs
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
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Fagnavn
