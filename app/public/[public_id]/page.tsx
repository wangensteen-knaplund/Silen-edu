"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

interface PublicNote {
  id: string;
  content: string;
  created_at: string;
}

export default function PublicNotePage() {
  const params = useParams();
  const publicId = params.public_id as string;

  const [note, setNote] = useState<PublicNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPublicNote();
  }, [publicId]);

  const fetchPublicNote = async () => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("id, content, created_at")
        .eq("public_id", publicId)
        .eq("is_public", true)
        .single();

      if (error || !data) {
        console.error("Error fetching public note:", error);
        setError(true);
        return;
      }

      setNote(data);
    } catch (err) {
      console.error("Error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Laster...</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Notat ikke funnet
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Dette notatet eksisterer ikke eller er ikke lenger offentlig.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Gå til forsiden
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                📚 Delt notat
              </h1>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(note.created_at).toLocaleDateString("no-NO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dette er et offentlig delt notat fra StudyApp
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
              {note.content}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Vil du også lage og dele dine egne notater?
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Prøv StudyApp gratis
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
