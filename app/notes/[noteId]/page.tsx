"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useAppStore } from "@/store/useAppStore";
import { useNotesStore } from "@/store/useNotesStore";

export default function NoteDetailPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const hydrationStatus = useAppStore((state) => state.hydrationStatus);
  const appError = useAppStore((state) => state.error);

  const getNoteById = useNotesStore((state) => state.getById);
  const notesInitialized = useNotesStore((state) => state.initialized);
  const notesLoading = useNotesStore((state) => state.loading);
  const note = getNoteById(noteId);

  if (!user) return null;

  if (hydrationStatus !== "ready" || notesLoading || !notesInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Laster notat…</p>
      </div>
    );
  }

  if (appError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-700 bg-red-100 px-4 py-2 rounded">{appError}</p>
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

  const title = note.title?.trim() || "Uten tittel";

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link
        href={`/notes?subjectId=${note.subjectId}`}
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Tilbake til notater
      </Link>

      <h1 className="text-2xl font-bold mb-4">{title}</h1>

      <div className="prose max-w-none whitespace-pre-wrap">
        <p>{note.content}</p>
      </div>
    </div>
  );
}
