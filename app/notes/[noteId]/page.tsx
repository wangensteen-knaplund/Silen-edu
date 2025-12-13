"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useNotesStore } from "@/store/useNotesStore";
import { useSubjectsStore } from "@/store/useSubjectsStore";
import { generateSummaryPlaceholder } from "@/lib/ai/summaries";

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.noteId as string;

  const notes = useNotesStore((state) => state.notes);
  const updateNote = useNotesStore((state) => state.updateNote);
  const subjects = useSubjectsStore((state) => state.subjects);

  const note = notes.find((n) => n.id === noteId);

  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [generatingSummary, setGeneratingSummary] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setSubjectId(note.subjectId);
      setContent(note.content);
    }
  }, [note]);

  if (!note) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Notat ikke funnet</p>
            <Link href="/notes" className="text-blue-600 hover:underline mt-4 inline-block">
              Tilbake til notater
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (!title.trim() || !subjectId || !content.trim()) {
      alert("Vennligst fyll ut tittel, fag og innhold");
      return;
    }

    updateNote(noteId, {
      title: title.trim(),
      subjectId,
      content: content.trim(),
      updatedAt: new Date().toISOString(),
    });

    alert("Notat oppdatert!");
    router.push("/notes");
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
              Rediger notat
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
                />
              </div>

              {/* AI Summary Button */}
              <div>
                <button
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary}
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
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Lagre endringer
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
