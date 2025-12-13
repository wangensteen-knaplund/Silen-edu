"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useNotesStore } from "@/store/useNotesStore";
import { useSubjectsStore } from "@/store/useSubjectsStore";

export default function SubjectsInitializer() {
  const { user } = useAuth();
  const loadSubjects = useSubjectsStore((state) => state.loadSubjects);
  const resetSubjects = useSubjectsStore((state) => state.reset);
  const loadNotes = useNotesStore((state) => state.loadNotes);
  const resetNotes = useNotesStore((state) => state.reset);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      if (!user) {
        resetSubjects();
        resetNotes();
        return;
      }

      await loadSubjects(user.id);
      if (cancelled) return;

      await loadNotes(user.id);
    };

    hydrate();

    return () => {
      cancelled = true;
    };
  }, [user, loadSubjects, loadNotes, resetSubjects, resetNotes]);

  return null;
}
