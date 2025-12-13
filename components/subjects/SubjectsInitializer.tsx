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
    if (user) {
      loadSubjects(user.id);
      loadNotes(user.id);
    } else {
      resetSubjects();
      resetNotes();
    }
  }, [user, loadSubjects, loadNotes, resetSubjects, resetNotes]);

  return null;
}
