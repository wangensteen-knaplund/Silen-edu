"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import NoteEditor from "@/components/NoteEditor";
import { supabase } from "@/lib/supabaseClient";
import { nanoid } from "nanoid";

interface Note {
  id: string;
  subject_id: string;
  content: string;
  is_public: boolean;
  public_id: string | null;
}

export default function NotePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewNote, setIsNewNote] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  useEffect(() => {
    checkUserAndFetch();
  }, [id]);

  const checkUserAndFetch = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Check if id is a subject_id (for new note) or note_id (for editing)
    const { data: existingNote, error } = await supabase
      .from("notes")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching note:", error);
    }

    if (existingNote) {
      setNote(existingNote);
      setIsNewNote(false);
    } else {
      // This is a new note, id is the subject_id
      setNote({
        id: "",
        subject_id: id,
        content: "",
        is_public: false,
        public_id: null,
      });
      setIsNewNote(true);
    }

    setLoading(false);
  };

  const handleSave = async (content: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (isNewNote) {
        const { data, error } = await supabase
          .from("notes")
          .insert({
            user_id: user.id,
            subject_id: note?.subject_id,
            content,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating note:", error);
          alert("Feil ved lagring av notat");
          return;
        }

        if (data) {
          alert("Notat opprettet!");
          router.push(`/subjects/${note?.subject_id}`);
        }
      } else {
        const { error } = await supabase
          .from("notes")
          .update({ content })
          .eq("id", note?.id);

        if (error) {
          console.error("Error updating note:", error);
          alert("Feil ved lagring av notat");
          return;
        }

        setNote({ ...note!, content });
        alert("Notat lagret!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Feil ved lagring av notat");
    }
  };

  const handleTogglePublic = async () => {
    if (!note || isNewNote) return;

    try {
      const newIsPublic = !note.is_public;
      const publicId = newIsPublic && !note.public_id ? nanoid(10) : note.public_id;

      const { error } = await supabase
        .from("notes")
        .update({
          is_public: newIsPublic,
          public_id: publicId,
        })
        .eq("id", note.id);

      if (error) {
        console.error("Error updating note:", error);
        alert("Feil ved oppdatering av notat");
        return;
      }

      setNote({ ...note, is_public: newIsPublic, public_id: publicId });
      alert(
        newIsPublic
          ? `Notatet er nå offentlig! Del denne linken: ${window.location.origin}/public/${publicId}`
          : "Notatet er nå privat"
      );
    } catch (error) {
      console.error("Error:", error);
      alert("Feil ved oppdatering av notat");
    }
  };

  const handleAIAction = async (action: "summary" | "quiz") => {
    if (!note?.content) {
      alert("Notatet er tomt");
      return;
    }

    setAiLoading(true);
    setAiResult(null);

    try {
      const response = await fetch(`/api/ai/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: note.content,
          noteId: note.id,
        }),
      });

      if (!response.ok) {
        throw new Error("AI request failed");
      }

      const data = await response.json();
      setAiResult(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Feil ved AI-behandling. Sjekk at API-nøkkel er konfigurert.");
    } finally {
      setAiLoading(false);
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

  if (!note) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {isNewNote ? "Nytt notat" : "Rediger notat"}
            </h1>
            {!isNewNote && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleTogglePublic}
                  className={`px-4 py-2 rounded-lg ${
                    note.is_public
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-600 hover:bg-gray-700"
                  } text-white`}
                >
                  {note.is_public ? "🔓 Offentlig" : "🔒 Privat"}
                </button>
                {note.is_public && note.public_id && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/public/${note.public_id}`
                      );
                      alert("Link kopiert!");
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    📋 Kopier link
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <NoteEditor
                initialContent={note.content}
                onSave={handleSave}
                onCancel={() => router.push(`/subjects/${note.subject_id}`)}
              />
            </div>

            {!isNewNote && (
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    🧠 AI-funksjoner
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAIAction("summary")}
                      disabled={aiLoading}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {aiLoading ? "Behandler..." : "Oppsummer notat"}
                    </button>
                    <button
                      onClick={() => handleAIAction("quiz")}
                      disabled={aiLoading}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {aiLoading ? "Behandler..." : "Generer quiz"}
                    </button>
                  </div>

                  {aiResult && (
                    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                        Resultat:
                      </h4>
                      <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        {typeof aiResult === "string"
                          ? aiResult
                          : JSON.stringify(aiResult, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
