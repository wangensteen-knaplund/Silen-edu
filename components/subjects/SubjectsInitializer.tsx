"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useSubjectsStore } from "@/store/useSubjectsStore";

export default function SubjectsInitializer() {
  const { user } = useAuth();
  const ensureSubjectsLoaded = useSubjectsStore(
    (state) => state.ensureSubjectsLoaded
  );
  const resetSubjects = useSubjectsStore((state) => state.reset);

  useEffect(() => {
    if (user) {
      ensureSubjectsLoaded(user.id);
    } else {
      resetSubjects();
    }
  }, [user, ensureSubjectsLoaded, resetSubjects]);

  return null;
}
