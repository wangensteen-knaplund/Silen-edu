"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useNotesStore } from "@/store/useNotesStore";
import Link from "next/link";

export default function NoteDetailPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const getNoteById = useNotesStore((state) => state.getById);
  const notesInitialized = useNotesStore((state) => state.initialized);
  const notesLoading = useNotesStore((state) => state.loading);
  const note = getNoteById(noteId);

  if (!user) return null;

  if (notesLoading || !notesInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Laster notat…</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-500">Fant ikke notatet.</p>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline"
          >
            Gå tilbake
          </button>
        </div>
      </div>
    );
  }

  const title = (() => {
    const firstLine = note.content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0);
    return firstLine || "Uten tittel";
  })();

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link
        href={`/notes?subjectId=${note.subjectId}`}
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Tilbake til notater
      </Link>

      <h1 className="text-2xl font-bold mb-4">{title}</h1>

      <div className="prose max-w-none">
        <p>{note.content}</p>
      </div>
    </div>
  );
}
