"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useAppStore } from "@/store/useAppStore";
import { useNotesStore } from "@/store/useNotesStore";
import { usePlannerStore } from "@/store/usePlannerStore";
import { useSubjectsStore } from "@/store/useSubjectsStore";

export default function AppInitializer() {
  const { user, loading: authLoading } = useAuth();
  const { hydrationStatus, error, startHydration, setReady, setError, reset } =
    useAppStore();

  const loadSubjects = useSubjectsStore((state) => state.loadSubjects);
  const resetSubjects = useSubjectsStore((state) => state.reset);

  const loadNotes = useNotesStore((state) => state.loadNotes);
  const resetNotes = useNotesStore((state) => state.reset);

  const resetPlanner = usePlannerStore((state) => state.reset);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      reset();
      resetSubjects();
      resetNotes();
      resetPlanner();
      return;
    }

    if (hydrationStatus === "ready" || hydrationStatus === "loading") {
      return;
    }

    startHydration();

    const hydrate = async () => {
      try {
        await loadSubjects(user.id);
        await loadNotes(user.id);
        setReady();
      } catch (err) {
        console.error("Hydration error", err);
        setError("Kunne ikke laste data. Prøv igjen.");
      }
    };

    void hydrate();
  }, [
    authLoading,
    user,
    hydrationStatus,
    startHydration,
    loadSubjects,
    loadNotes,
    setReady,
    setError,
    reset,
    resetSubjects,
    resetNotes,
    resetPlanner,
  ]);

  if (error) {
    return (
      <div className="w-full bg-red-100 text-red-800 px-4 py-3 text-sm text-center">
        {error}
      </div>
    );
  }

  return null;
}
