"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useSubjectsStore } from "@/store/useSubjectsStore";

export default function SubjectsInitializer() {
  const { user } = useAuth();
  const loadSubjects = useSubjectsStore((state) => state.loadSubjects);
  const setSubjects = useSubjectsStore((state) => state.setSubjects);

  useEffect(() => {
    if (user) {
      loadSubjects(user.id);
    } else {
      setSubjects([]);
    }
  }, [user, loadSubjects, setSubjects]);

  return null;
}
