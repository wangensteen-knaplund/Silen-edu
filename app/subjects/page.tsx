"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import SubjectCard from "@/components/SubjectCard";
import { supabase } from "@/lib/supabaseClient";

interface Subject {
  id: string;
  name: string;
  note_count?: number;
}

export default function SubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    checkUserAndFetch();
  }, []);

  const checkUserAndFetch = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    fetchSubjects(user.id);
  };

  const fetchSubjects = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("user_id", userId)
        .order("name");

      if (error) {
        console.error("Error fetching subjects:", error);
        return;
      }

      if (data) {
        const subjectsWithCounts = await Promise.all(
          data.map(async (subject) => {
            const { count } = await supabase
              .from("notes")
              .select("*", { count: "exact", head: true })
              .eq("subject_id", subject.id);

            return {
              ...subject,
              note_count: count || 0,
            };
          })
        );

        setSubjects(subjectsWithCounts);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    setCreating(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("subjects").insert({
        user_id: user.id,
        name: newSubjectName.trim(),
      });

      if (error) {
        console.error("Error creating subject:", error);
        alert("Feil ved opprettelse av fag");
        return;
      }

      setNewSubjectName("");
      fetchSubjects(user.id);
    } catch (error) {
      console.error("Error:", error);
      alert("Feil ved opprettelse av fag");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Mine fag
          </h1>

          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Opprett nytt fag
            </h2>
            <form onSubmit={handleCreateSubject} className="flex gap-2">
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Fagnavn, f.eks. Matematikk"
                disabled={creating}
              />
              <button
                type="submit"
                disabled={creating || !newSubjectName.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Oppretter..." : "Opprett"}
              </button>
            </form>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Laster...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Du har ingen fag ennå. Opprett ditt første fag ovenfor!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  id={subject.id}
                  name={subject.name}
                  noteCount={subject.note_count}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
