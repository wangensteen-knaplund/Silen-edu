"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useNotesStore } from "@/store/useNotesStore";
import { useSubjectsStore } from "@/store/useSubjectsStore";
import { useStudyTrackerStore } from "@/store/useStudyTrackerStore";
import { useAuth } from "@/components/AuthProvider";

export default function NewNotePage() {
  const router = useRouter();
  const { user } = useAuth();
  const subjects = useSubjectsStore((state) => state.subjects);
  const subjectsInitialized = useSubjectsStore((state) => state.initialized);
  const addNote = useNotesStore((state) => state.addNote);
  const registerNoteEdited = useStudyTrackerStore((state) => state.registerNoteEdited);

  const [subjectId, setSubjectId] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) {
      alert("Du må være innlogget for å lagre notater");
      return;
    }

    const trimmedContent = content.trim();

    if (!subjectId || !trimmedContent) {
      alert("Vennligst fyll ut fag og innhold");
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("notes")
        .insert([
          {
            user_id: user.id,
            subject_id: subjectId,
            content: trimmedContent,
          },
        ])
        .select()
        .single();

      if (error || !data) {
        console.error("Error saving note:", error);
        alert("Kunne ikke lagre notatet. Prøv igjen.");
        return;
      }

      const newNote = {
        id: data.id,
        userId: data.user_id,
        subjectId: data.subject_id,
        content: data.content,
        createdAt: data.created_at,
      };

      addNote(newNote);
      registerNoteEdited();
      router.push(`/notes?subjectId=${subjectId}`);
    } catch (err) {
      console.error("Unexpected error saving note:", err);
      alert("Kunne ikke lagre notatet. Prøv igjen.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  if (!subjectsInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Laster fag…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link
              href="/notes"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-2 inline-block"
            >
              ← Tilbake til notater
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Nytt notat
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="space-y-6">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Fag
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={saving}
                >
                  <option value="">Velg fag</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Innhold
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-64 resize-y"
                  placeholder="Skriv notatet ditt her..."
                  disabled={saving}
                />
              </div>

              {/* Save Button */}
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? "Lagrer..." : "Lagre notat"}
                </button>
                <Link
                  href="/notes"
                  className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Avbryt
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
