"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SubjectCard from "@/components/SubjectCard";
import { supabase } from "@/lib/supabaseClient";

interface Subject {
  id: string;
  name: string;
  note_count?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    setUser(user);
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
        // Fetch note counts for each subject
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <Link
              href="/subjects"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Nytt fag
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Laster...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Du har ingen fag ennå. Opprett ditt første fag for å komme i
                gang!
              </p>
              <Link
                href="/subjects"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Opprett fag
              </Link>
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
