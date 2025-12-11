"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PlannerLite from "@/components/PlannerLite";
import { supabase } from "@/lib/supabaseClient";

interface Subject {
  id: string;
  name: string;
}

interface Note {
  id: string;
  content: string;
  created_at: string;
}

export default function SubjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.id as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserAndFetch();
  }, [subjectId]);

  const checkUserAndFetch = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    fetchSubjectAndNotes(user.id);
  };

  const fetchSubjectAndNotes = async (userId: string) => {
    try {
      // Fetch subject
      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("id", subjectId)
        .eq("user_id", userId)
        .single();

      if (subjectError || !subjectData) {
        console.error("Error fetching subject:", subjectError);
        router.push("/subjects");
        return;
      }

      setSubject(subjectData);

      // Fetch notes
      const { data: notesData, error: notesError } = await supabase
        .from("notes")
        .select("id, content, created_at")
        .eq("subject_id", subjectId)
        .order("created_at", { ascending: false });

      if (notesError) {
        console.error("Error fetching notes:", notesError);
        return;
      }

      setNotes(notesData || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Er du sikker på at du vil slette dette notatet?")) return;

    try {
      const { error } = await supabase.from("notes").delete().eq("id", noteId);

      if (error) {
        console.error("Error deleting note:", error);
        alert("Feil ved sletting av notat");
        return;
      }

      setNotes(notes.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error("Error:", error);
      alert("Feil ved sletting av notat");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Laster...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Link
                href="/subjects"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-2 inline-block"
              >
                ← Tilbake til fag
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {subject.name}
              </h1>
            </div>
            <Link
              href={`/notes/${subjectId}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Nytt notat
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Notater
              </h2>
              {notes.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Ingen notater ennå. Opprett ditt første notat!
                  </p>
                  <Link
                    href={`/notes/${subjectId}`}
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Opprett notat
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(note.created_at).toLocaleDateString(
                            "no-NO",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                        <div className="flex gap-2">
                          <Link
                            href={`/notes/${note.id}`}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                          >
                            Rediger
                          </Link>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                          >
                            Slett
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-900 dark:text-white line-clamp-3">
                        {note.content.slice(0, 200)}
                        {note.content.length > 200 && "..."}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <PlannerLite subjectId={subjectId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
