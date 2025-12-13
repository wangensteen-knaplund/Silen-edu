"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useNotesStore } from "@/store/useNotesStore";
import { useSubjectsStore } from "@/store/useSubjectsStore";
import { useStudyTrackerStore } from "@/store/useStudyTrackerStore";
import { generateSummaryPlaceholder } from "@/lib/ai/summaries";
import { useAuth } from "@/components/AuthProvider";

export default function NewNotePage() {
  const router = useRouter();
  const { user } = useAuth();
  const subjects = useSubjectsStore((state) => state.subjects);
  const subjectsInitialized = useSubjectsStore((state) => state.initialized);
  const addNote = useNotesStore((state) => state.addNote);
  const registerNoteEdited = useStudyTrackerStore((state) => state.registerNoteEdited);

  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) {
      alert("Du må være innlogget for å lagre notater");
      return;
    }

    if (!subjectId || !content.trim()) {
      alert("Vennligst fyll ut fag og innhold");
      return;
    }

    const combinedContent = title.trim()
      ? `${title.trim()}\n\n${content.trim()}`
      : content.trim();

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("notes")
        .insert([
          {
            user_id: user.id,
            subject_id: subjectId,
            content: combinedContent,
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
        updatedAt: data.updated_at ?? undefined,
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

  const handleGenerateSummary = async () => {
    if (!content.trim()) {
      alert("Skriv litt innhold først");
      return;
    }

    setGeneratingSummary(true);
    try {
      const summary = await generateSummaryPlaceholder(content);
      setAiSummary(summary);
    } catch (error) {
      console.error("Error generating summary:", error);
      alert("Feil ved generering av sammendrag");
    } finally {
      setGeneratingSummary(false);
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
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Tittel
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="F.eks. Derivasjon og integrasjon"
                  disabled={saving}
                />
              </div>

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

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Tags (Placeholder - kommaseparert)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="F.eks. matte, eksamen, viktig"
                  disabled={saving}
                />
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

              {/* AI Summary Button */}
              <div>
                <button
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary || saving}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingSummary
                    ? "Genererer..."
                    : "🤖 Generate summary (AI placeholder)"}
                </button>
                {aiSummary && (
                  <div className="mt-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">
                      AI Sammendrag:
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">{aiSummary}</p>
                  </div>
                )}
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
