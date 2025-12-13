"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useNotesStore } from "@/store/useNotesStore";
import Link from "next/link";

export default function NoteDetailPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const loadNotes = useNotesStore((s) => s.loadNotes);
  const notesBySubjectId = useNotesStore((s) => s.notesBySubjectId);

  // Finn notatet på tvers av alle fag
  const allNotes = Object.values(notesBySubjectId).flat();
  const note = allNotes.find((n) => n.id === noteId);

  // Last notater hvis vi ikke har dem ennå
  useEffect(() => {
    if (!user || note) return;

    // fallback: last ALLE fag-notater (midlertidig)
    // bedre optimalisering kan komme senere
    Object.keys(notesBySubjectId).forEach((subjectId) => {
      loadNotes(user.id, subjectId);
    });
  }, [user, note, loadNotes, notesBySubjectId]);

  if (!user) return null;

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Laster notat…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link
        href={`/notes?subjectId=${note.subjectId}`}
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Tilbake til notater
      </Link>

      <h1 className="text-2xl font-bold mb-4">{note.title}</h1>

      <div className="prose max-w-none">
        <p>{note.content}</p>
      </div>
    </div>
  );
}
