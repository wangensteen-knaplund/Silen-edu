"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import SubjectCard from "@/components/SubjectCard";

interface Subject {
  id: string;
  name: string;
  semester?: string;
  examDate?: string;
}

export default function SubjectsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectSemester, setNewSubjectSemester] = useState("");
  const [newSubjectExamDate, setNewSubjectExamDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubjects();
    }
  }, [user]);

  const fetchSubjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, semester, exam_date")
        .eq("user_id", user.id)
        .order("name");

      if (error) {
        console.error("Error fetching subjects:", error);
        return;
      }

      if (data) {
        const mappedSubjects = data.map((subject) => ({
          id: subject.id,
          name: subject.name,
          semester: subject.semester,
          examDate: subject.exam_date,
        }));
        setSubjects(mappedSubjects);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      alert("Vennligst skriv inn et fagnavn");
      return;
    }

    if (!user) {
      alert("Du må være innlogget for å legge til fag");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("subjects")
        .insert([
          {
            user_id: user.id,
            name: newSubjectName.trim(),
            semester: newSubjectSemester.trim() || null,
            exam_date: newSubjectExamDate || null,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error adding subject:", error);
        alert("Kunne ikke legge til fag. Prøv igjen.");
        return;
      }

      if (data) {
        // Add to local state
        const newSubject: Subject = {
          id: data.id,
          name: data.name,
          semester: data.semester,
          examDate: data.exam_date,
        };
        setSubjects([...subjects, newSubject]);

        // Reset form
        setNewSubjectName("");
        setNewSubjectSemester("");
        setNewSubjectExamDate("");
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Kunne ikke legge til fag. Prøv igjen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null; // AuthProvider will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mine fag
            </h1>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {showAddForm ? "Avbryt" : "+ Nytt fag"}
            </button>
          </div>

          {showAddForm && (
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Legg til nytt fag
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Fagnavn *
                  </label>
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
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Semester (valgfritt)
                  </label>
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
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Eksamensdato (valgfritt)
                  </label>
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

          {loading ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="text-gray-600 dark:text-gray-400">Laster...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="text-gray-600 dark:text-gray-400">
                Du har ingen fag ennå. Fag vil bli lagt til her.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  id={subject.id}
                  name={subject.name}
                  examDate={subject.examDate}
                  noteCount={0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
