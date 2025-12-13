# V2 Architecture - Implementation Guide

This document provides concrete implementation patterns for the V2 architecture. Read [ARCHITECTURE_V2.md](./ARCHITECTURE_V2.md) first for the conceptual foundation.

---

## 1. Store Patterns

### A) useAppStore (NEW)

**Purpose:** Track global hydration state

```typescript
// store/useAppStore.ts
import { create } from "zustand";

interface AppStore {
  // State
  hydrated: boolean;
  hydrating: boolean;
  hydrateError: Error | null;

  // Actions
  setHydrated: (value: boolean) => void;
  setHydrating: (value: boolean) => void;
  setHydrateError: (error: Error | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  hydrated: false,
  hydrating: false,
  hydrateError: null,

  setHydrated: (value) => set({ hydrated: value }),
  setHydrating: (value) => set({ hydrating: value }),
  setHydrateError: (error) => set({ hydrateError: error }),
  reset: () =>
    set({
      hydrated: false,
      hydrating: false,
      hydrateError: null,
    }),
}));
```

### B) useSubjectsStore (REFACTORED)

**Key changes:**
- Remove hydration of other stores
- Add explicit error handling
- Simplify to pure subject management

```typescript
// store/useSubjectsStore.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { Subject } from "@/types/data";

interface SubjectsStore {
  // State
  subjects: Subject[];
  loading: boolean;
  initialized: boolean;
  error: Error | null;

  // Actions
  loadSubjects: (userId: string) => Promise<Subject[]>;
  getById: (subjectId: string) => Subject | undefined;
  addSubject: (subject: Subject) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  removeSubject: (id: string) => void;
  reset: () => void;
}

export const useSubjectsStore = create<SubjectsStore>((set, get) => {
  // Deduplication state
  let loadPromise: Promise<Subject[]> | null = null;
  let lastUserId: string | null = null;

  const fetchSubjects = async (userId: string): Promise<Subject[]> => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, user_id, name, semester, exam_date, created_at")
        .eq("user_id", userId)
        .order("name");

      if (error) throw error;

      const mapped: Subject[] = (data ?? []).map((s) => ({
        id: s.id,
        userId: s.user_id,
        name: s.name,
        semester: s.semester ?? undefined,
        examDate: s.exam_date ?? undefined,
        createdAt: s.created_at,
      }));

      set({
        subjects: mapped,
        loading: false,
        initialized: true,
        error: null,
      });

      return mapped;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      set({
        subjects: [],
        loading: false,
        initialized: true,
        error: err,
      });
      throw err;
    }
  };

  const loadSubjects = async (userId: string): Promise<Subject[]> => {
    if (!userId) {
      lastUserId = null;
      set({ subjects: [], loading: false, initialized: false, error: null });
      return [];
    }

    // Return cached data if already loaded for this user
    if (get().initialized && !get().loading && lastUserId === userId) {
      return get().subjects;
    }

    // Deduplicate concurrent calls
    if (loadPromise) {
      return loadPromise;
    }

    lastUserId = userId;
    loadPromise = fetchSubjects(userId);
    const result = await loadPromise;
    loadPromise = null;
    return result;
  };

  return {
    subjects: [],
    loading: false,
    initialized: false,
    error: null,

    loadSubjects,
    getById: (subjectId) => get().subjects.find((s) => s.id === subjectId),

    addSubject: (subject) =>
      set((state) => ({
        subjects: [...state.subjects, subject],
        initialized: true,
      })),

    updateSubject: (id, updates) =>
      set((state) => ({
        subjects: state.subjects.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      })),

    removeSubject: (id) =>
      set((state) => ({
        subjects: state.subjects.filter((s) => s.id !== id),
      })),

    reset: () => {
      lastUserId = null;
      loadPromise = null;
      set({
        subjects: [],
        loading: false,
        initialized: false,
        error: null,
      });
    },
  };
});
```

### C) usePlannerStore (REFACTORED)

**Key changes:**
- Per-subject indexing
- Lazy loading per subject
- Remove global hydration

```typescript
// store/usePlannerStore.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import {
  PlannerLiteData,
  PlannerProData,
  Goal,
  Deadline,
  ReadingItem,
} from "@/types/planner";

interface PlannerStore {
  // State - indexed by subjectId
  plannerLiteBySubjectId: Record<string, PlannerLiteData>;
  plannerProBySubjectId: Record<string, PlannerProData>;
  goalsBySubjectId: Record<string, Goal[]>;
  loadingBySubjectId: Record<string, boolean>;
  initializedBySubjectId: Record<string, boolean>;
  errorBySubjectId: Record<string, Error | null>;

  // Actions
  loadPlannerForSubject: (subjectId: string) => Promise<void>;
  setExamDate: (subjectId: string, date: string) => Promise<void>;
  addGoal: (subjectId: string, goal: Goal) => Promise<void>;
  removeGoal: (subjectId: string, goalId: string) => Promise<void>;
  addDeadline: (subjectId: string, deadline: Deadline) => Promise<void>;
  removeDeadline: (subjectId: string, deadlineId: string) => Promise<void>;
  addReadingItem: (subjectId: string, item: ReadingItem) => Promise<void>;
  toggleReadingItem: (subjectId: string, itemId: string) => Promise<void>;
  removeReadingItem: (subjectId: string, itemId: string) => Promise<void>;
  reset: () => void;
  resetSubject: (subjectId: string) => void;
}

export const usePlannerStore = create<PlannerStore>((set, get) => {
  // Deduplication per subject
  const loadPromises: Record<string, Promise<void>> = {};

  const fetchPlannerForSubject = async (subjectId: string): Promise<void> => {
    set((state) => ({
      loadingBySubjectId: { ...state.loadingBySubjectId, [subjectId]: true },
      errorBySubjectId: { ...state.errorBySubjectId, [subjectId]: null },
    }));

    try {
      // Load exam date from subject
      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("exam_date")
        .eq("id", subjectId)
        .single();

      if (subjectError) throw subjectError;

      // Load goals
      const { data: goalsData, error: goalsError } = await supabase
        .from("planner_goals")
        .select("*")
        .eq("subject_id", subjectId)
        .order("created_at");

      if (goalsError && goalsError.code !== "PGRST116") throw goalsError; // Ignore "not found"

      // Load deadlines
      const { data: deadlinesData, error: deadlinesError } = await supabase
        .from("deadlines")
        .select("*")
        .eq("subject_id", subjectId)
        .order("due_date");

      if (deadlinesError && deadlinesError.code !== "PGRST116") throw deadlinesError;

      // Load reading items
      const { data: readingData, error: readingError } = await supabase
        .from("reading_items")
        .select("*")
        .eq("subject_id", subjectId)
        .order("created_at");

      if (readingError && readingError.code !== "PGRST116") throw readingError;

      // Map to frontend types
      const goals: Goal[] = (goalsData || []).map((g) => ({
        id: g.id,
        subjectId: g.subject_id,
        text: g.text,
      }));

      const deadlines: Deadline[] = (deadlinesData || []).map((d) => ({
        id: d.id,
        subjectId: d.subject_id,
        title: d.title,
        dueDate: d.due_date,
        type: d.type as "innlevering" | "prøve" | "prosjekt",
      }));

      const readingItems: ReadingItem[] = (readingData || []).map((r) => ({
        id: r.id,
        subjectId: r.subject_id,
        text: r.text,
        completed: r.completed,
      }));

      set((state) => ({
        plannerLiteBySubjectId: {
          ...state.plannerLiteBySubjectId,
          [subjectId]: {
            subjectId,
            examDate: subjectData?.exam_date || "",
          },
        },
        plannerProBySubjectId: {
          ...state.plannerProBySubjectId,
          [subjectId]: {
            subjectId,
            examDate: subjectData?.exam_date || "",
            deadlines,
            readingItems,
          },
        },
        goalsBySubjectId: {
          ...state.goalsBySubjectId,
          [subjectId]: goals,
        },
        loadingBySubjectId: {
          ...state.loadingBySubjectId,
          [subjectId]: false,
        },
        initializedBySubjectId: {
          ...state.initializedBySubjectId,
          [subjectId]: true,
        },
        errorBySubjectId: {
          ...state.errorBySubjectId,
          [subjectId]: null,
        },
      }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      set((state) => ({
        loadingBySubjectId: {
          ...state.loadingBySubjectId,
          [subjectId]: false,
        },
        initializedBySubjectId: {
          ...state.initializedBySubjectId,
          [subjectId]: true,
        },
        errorBySubjectId: {
          ...state.errorBySubjectId,
          [subjectId]: err,
        },
      }));
      throw err;
    }
  };

  const loadPlannerForSubject = async (subjectId: string): Promise<void> => {
    // Return cached if already loaded
    if (get().initializedBySubjectId[subjectId]) {
      return;
    }

    // Deduplicate concurrent calls
    if (loadPromises[subjectId]) {
      return loadPromises[subjectId];
    }

    loadPromises[subjectId] = fetchPlannerForSubject(subjectId);
    await loadPromises[subjectId];
    delete loadPromises[subjectId];
  };

  return {
    plannerLiteBySubjectId: {},
    plannerProBySubjectId: {},
    goalsBySubjectId: {},
    loadingBySubjectId: {},
    initializedBySubjectId: {},
    errorBySubjectId: {},

    loadPlannerForSubject,

    setExamDate: async (subjectId, date) => {
      await supabase
        .from("subjects")
        .update({ exam_date: date })
        .eq("id", subjectId);

      set((state) => ({
        plannerLiteBySubjectId: {
          ...state.plannerLiteBySubjectId,
          [subjectId]: {
            subjectId,
            examDate: date,
          },
        },
      }));
    },

    addGoal: async (subjectId, goal) => {
      await supabase.from("planner_goals").insert({
        id: goal.id,
        subject_id: subjectId,
        text: goal.text,
      });

      set((state) => ({
        goalsBySubjectId: {
          ...state.goalsBySubjectId,
          [subjectId]: [...(state.goalsBySubjectId[subjectId] || []), goal],
        },
      }));
    },

    removeGoal: async (subjectId, goalId) => {
      await supabase.from("planner_goals").delete().eq("id", goalId);

      set((state) => ({
        goalsBySubjectId: {
          ...state.goalsBySubjectId,
          [subjectId]: (state.goalsBySubjectId[subjectId] || []).filter(
            (g) => g.id !== goalId
          ),
        },
      }));
    },

    addDeadline: async (subjectId, deadline) => {
      await supabase.from("deadlines").insert({
        id: deadline.id,
        subject_id: subjectId,
        title: deadline.title,
        due_date: deadline.dueDate,
        type: deadline.type,
      });

      set((state) => {
        const existing = state.plannerProBySubjectId[subjectId] || {
          subjectId,
          examDate: "",
          deadlines: [],
          readingItems: [],
        };
        return {
          plannerProBySubjectId: {
            ...state.plannerProBySubjectId,
            [subjectId]: {
              ...existing,
              deadlines: [...existing.deadlines, deadline],
            },
          },
        };
      });
    },

    removeDeadline: async (subjectId, deadlineId) => {
      await supabase.from("deadlines").delete().eq("id", deadlineId);

      set((state) => {
        const existing = state.plannerProBySubjectId[subjectId];
        if (!existing) return state;
        return {
          plannerProBySubjectId: {
            ...state.plannerProBySubjectId,
            [subjectId]: {
              ...existing,
              deadlines: existing.deadlines.filter((d) => d.id !== deadlineId),
            },
          },
        };
      });
    },

    addReadingItem: async (subjectId, item) => {
      await supabase.from("reading_items").insert({
        id: item.id,
        subject_id: subjectId,
        text: item.text,
        completed: item.completed,
      });

      set((state) => {
        const existing = state.plannerProBySubjectId[subjectId] || {
          subjectId,
          examDate: "",
          deadlines: [],
          readingItems: [],
        };
        return {
          plannerProBySubjectId: {
            ...state.plannerProBySubjectId,
            [subjectId]: {
              ...existing,
              readingItems: [...existing.readingItems, item],
            },
          },
        };
      });
    },

    toggleReadingItem: async (subjectId, itemId) => {
      const item = get()
        .plannerProBySubjectId[subjectId]?.readingItems.find(
          (i) => i.id === itemId
        );
      if (!item) return;

      await supabase
        .from("reading_items")
        .update({ completed: !item.completed })
        .eq("id", itemId);

      set((state) => {
        const existing = state.plannerProBySubjectId[subjectId];
        if (!existing) return state;
        return {
          plannerProBySubjectId: {
            ...state.plannerProBySubjectId,
            [subjectId]: {
              ...existing,
              readingItems: existing.readingItems.map((i) =>
                i.id === itemId ? { ...i, completed: !i.completed } : i
              ),
            },
          },
        };
      });
    },

    removeReadingItem: async (subjectId, itemId) => {
      await supabase.from("reading_items").delete().eq("id", itemId);

      set((state) => {
        const existing = state.plannerProBySubjectId[subjectId];
        if (!existing) return state;
        return {
          plannerProBySubjectId: {
            ...state.plannerProBySubjectId,
            [subjectId]: {
              ...existing,
              readingItems: existing.readingItems.filter(
                (i) => i.id !== itemId
              ),
            },
          },
        };
      });
    },

    reset: () =>
      set({
        plannerLiteBySubjectId: {},
        plannerProBySubjectId: {},
        goalsBySubjectId: {},
        loadingBySubjectId: {},
        initializedBySubjectId: {},
        errorBySubjectId: {},
      }),

    resetSubject: (subjectId) =>
      set((state) => {
        const { [subjectId]: _, ...restLite } = state.plannerLiteBySubjectId;
        const { [subjectId]: __, ...restPro } = state.plannerProBySubjectId;
        const { [subjectId]: ___, ...restGoals } = state.goalsBySubjectId;
        const { [subjectId]: ____, ...restLoading } = state.loadingBySubjectId;
        const { [subjectId]: _____, ...restInit } =
          state.initializedBySubjectId;
        const { [subjectId]: ______, ...restError } = state.errorBySubjectId;

        return {
          plannerLiteBySubjectId: restLite,
          plannerProBySubjectId: restPro,
          goalsBySubjectId: restGoals,
          loadingBySubjectId: restLoading,
          initializedBySubjectId: restInit,
          errorBySubjectId: restError,
        };
      }),
  };
});
```

---

## 2. Component Patterns

### A) AppInitializer

**Replaces SubjectsInitializer**

```typescript
// components/AppInitializer.tsx
"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useAppStore } from "@/store/useAppStore";
import { useSubjectsStore } from "@/store/useSubjectsStore";
import { useNotesStore } from "@/store/useNotesStore";

export default function AppInitializer() {
  const { user } = useAuth();
  const setHydrating = useAppStore((state) => state.setHydrating);
  const setHydrated = useAppStore((state) => state.setHydrated);
  const setHydrateError = useAppStore((state) => state.setHydrateError);
  const resetApp = useAppStore((state) => state.reset);

  const loadSubjects = useSubjectsStore((state) => state.loadSubjects);
  const resetSubjects = useSubjectsStore((state) => state.reset);

  const loadNotes = useNotesStore((state) => state.loadNotes);
  const resetNotes = useNotesStore((state) => state.reset);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      if (!user) {
        // No user - reset everything
        resetApp();
        resetSubjects();
        resetNotes();
        return;
      }

      try {
        setHydrating(true);
        setHydrateError(null);

        // Phase 1: Load subjects (critical)
        await loadSubjects(user.id);
        if (cancelled) return;

        // Phase 2: Load notes (parallel-safe)
        await loadNotes(user.id);
        if (cancelled) return;

        // Mark as hydrated
        setHydrated(true);
      } catch (error) {
        console.error("Hydration error:", error);
        const err = error instanceof Error ? error : new Error(String(error));
        setHydrateError(err);
      } finally {
        setHydrating(false);
      }
    };

    hydrate();

    return () => {
      cancelled = true;
    };
  }, [
    user,
    loadSubjects,
    loadNotes,
    resetSubjects,
    resetNotes,
    resetApp,
    setHydrating,
    setHydrated,
    setHydrateError,
  ]);

  return null;
}
```

### B) Page Guard Hook

**Reusable hook for page-level guards**

```typescript
// hooks/usePageGuard.ts
import { useAppStore } from "@/store/useAppStore";
import { useSubjectsStore } from "@/store/useSubjectsStore";

export function usePageGuard() {
  const hydrated = useAppStore((s) => s.hydrated);
  const hydrating = useAppStore((s) => s.hydrating);
  const hydrateError = useAppStore((s) => s.hydrateError);

  const subjectsLoading = useSubjectsStore((s) => s.loading);
  const subjectsInitialized = useSubjectsStore((s) => s.initialized);

  const isReady = hydrated && subjectsInitialized && !subjectsLoading;
  const isLoading = hydrating || subjectsLoading || !subjectsInitialized;

  return {
    isReady,
    isLoading,
    error: hydrateError,
  };
}
```

### C) Subject Detail Page (REFACTORED)

**With all guards in place**

```typescript
// app/subjects/[subjectId]/page.tsx
"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePageGuard } from "@/hooks/usePageGuard";
import { useSubjectsStore } from "@/store/useSubjectsStore";
import { usePlannerStore } from "@/store/usePlannerStore";
import Oversikt from "@/components/subjects/Oversikt";

interface SubjectDetailPageProps {
  params: {
    subjectId: string;
  };
}

export default function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const { subjectId } = params;

  // Guard 1: Check global hydration
  const { isReady, isLoading, error } = usePageGuard();

  // Get subject data
  const subjects = useSubjectsStore((state) => state.subjects);
  const getSubjectById = useSubjectsStore((state) => state.getById);

  // Get planner state
  const loadPlannerForSubject = usePlannerStore(
    (state) => state.loadPlannerForSubject
  );
  const plannerLoading =
    usePlannerStore((state) => state.loadingBySubjectId[subjectId]) || false;
  const plannerInitialized =
    usePlannerStore((state) => state.initializedBySubjectId[subjectId]) ||
    false;

  // Load planner data for this subject
  useEffect(() => {
    if (isReady && subjectId) {
      loadPlannerForSubject(subjectId).catch((err) => {
        console.error("Failed to load planner:", err);
      });
    }
  }, [isReady, subjectId, loadPlannerForSubject]);

  // Guard 1: Global loading or error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 text-center">
          <p className="text-red-600 dark:text-red-400">
            Kunne ikke laste data: {error.message}
          </p>
          <Link
            href="/"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            Tilbake til hjem
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">Laster…</p>
        </div>
      </div>
    );
  }

  // Guard 2: Subject existence
  const subject = useMemo(
    () => getSubjectById(subjectId),
    [getSubjectById, subjectId]
  );

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">Fag ikke funnet</p>
          <Link
            href="/subjects"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            Tilbake til fag
          </Link>
        </div>
      </div>
    );
  }

  // Guard 3: Planner loading
  if (plannerLoading || !plannerInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Laster planlegger…
          </p>
        </div>
      </div>
    );
  }

  // Safe to render
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
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

          <div className="mb-6">
            <Oversikt subjectId={subjectId} isPro={true} />
          </div>

          <div className="flex gap-4 mb-6">
            <Link
              href={`/notes?subjectId=${subjectId}`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Åpne notater for faget
            </Link>

            <Link
              href={`/quiz/type/${subjectId}`}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Start quiz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### D) Oversikt Component (REFACTORED)

**Simplified to use new store API**

```typescript
// components/subjects/Oversikt.tsx
"use client";

import { useState } from "react";
import { usePlannerStore } from "@/store/usePlannerStore";
import { useSubjectsStore } from "@/store/useSubjectsStore";
import { daysUntil, formatDateNO } from "@/utils/date";
import { nanoid } from "nanoid";
import type { Goal, Deadline, ReadingItem } from "@/types/planner";

interface OversiktProps {
  subjectId: string;
  isPro: boolean;
}

export default function Oversikt({ subjectId, isPro }: OversiktProps) {
  // Get subject for context
  const subject = useSubjectsStore((s) =>
    s.subjects.find((sub) => sub.id === subjectId)
  );

  // Get planner data
  const plannerLite = usePlannerStore(
    (s) => s.plannerLiteBySubjectId[subjectId]
  );
  const plannerPro = usePlannerStore(
    (s) => s.plannerProBySubjectId[subjectId]
  );
  const goals = usePlannerStore((s) => s.goalsBySubjectId[subjectId] || []);

  // Actions
  const setExamDate = usePlannerStore((s) => s.setExamDate);
  const addGoal = usePlannerStore((s) => s.addGoal);
  const removeGoal = usePlannerStore((s) => s.removeGoal);
  const addDeadline = usePlannerStore((s) => s.addDeadline);
  const removeDeadline = usePlannerStore((s) => s.removeDeadline);
  const addReadingItem = usePlannerStore((s) => s.addReadingItem);
  const toggleReadingItem = usePlannerStore((s) => s.toggleReadingItem);
  const removeReadingItem = usePlannerStore((s) => s.removeReadingItem);

  // Local UI state
  const [isEditingExam, setIsEditingExam] = useState(false);
  const [tempExamDate, setTempExamDate] = useState(
    plannerLite?.examDate || subject?.examDate || ""
  );

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalText, setGoalText] = useState("");

  const [showDeadlineForm, setShowDeadlineForm] = useState(false);
  const [deadlineTitle, setDeadlineTitle] = useState("");
  const [deadlineDueDate, setDeadlineDueDate] = useState("");
  const [deadlineType, setDeadlineType] = useState<
    "innlevering" | "prøve" | "prosjekt"
  >("innlevering");

  const [showReadingForm, setShowReadingForm] = useState(false);
  const [readingText, setReadingText] = useState("");

  // Guard: Subject must exist
  if (!subject) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Kunne ikke laste oversikt
        </p>
      </div>
    );
  }

  const examDate = plannerLite?.examDate || subject.examDate || "";
  const daysToExam = examDate ? daysUntil(examDate) : null;
  const deadlines = plannerPro?.deadlines || [];
  const readingItems = plannerPro?.readingItems || [];
  const completedCount = readingItems.filter((i) => i.completed).length;

  const handleSaveExam = async () => {
    if (tempExamDate) {
      await setExamDate(subjectId, tempExamDate);
    }
    setIsEditingExam(false);
  };

  const handleAddGoal = async () => {
    if (!goalText.trim()) return;

    const newGoal: Goal = {
      id: nanoid(),
      subjectId,
      text: goalText.trim(),
    };

    await addGoal(subjectId, newGoal);
    setGoalText("");
    setShowGoalForm(false);
  };

  const handleAddDeadline = async () => {
    if (!deadlineTitle.trim() || !deadlineDueDate) return;

    const newDeadline: Deadline = {
      id: nanoid(),
      subjectId,
      title: deadlineTitle.trim(),
      dueDate: deadlineDueDate,
      type: deadlineType,
    };

    await addDeadline(subjectId, newDeadline);
    setDeadlineTitle("");
    setDeadlineDueDate("");
    setDeadlineType("innlevering");
    setShowDeadlineForm(false);
  };

  const handleAddReading = async () => {
    if (!readingText.trim()) return;

    const lines = readingText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    for (const line of lines) {
      const item: ReadingItem = {
        id: nanoid(),
        subjectId,
        text: line,
        completed: false,
      };
      await addReadingItem(subjectId, item);
    }

    setReadingText("");
    setShowReadingForm(false);
  };

  // Render sections...
  // (Similar to current Oversikt.tsx but with async handlers)
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Oversikt
      </h3>

      {/* Exam section */}
      <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            📅 Eksamen
          </h4>
          <button
            onClick={() => setIsEditingExam(!isEditingExam)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isEditingExam ? "Avbryt" : "Rediger"}
          </button>
        </div>

        {isEditingExam ? (
          <div className="space-y-4">
            <input
              type="date"
              value={tempExamDate}
              onChange={(e) => setTempExamDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <button
              onClick={handleSaveExam}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lagre
            </button>
          </div>
        ) : (
          <div>
            {examDate ? (
              <>
                <p className="text-gray-900 dark:text-white">
                  {formatDateNO(examDate)}
                </p>
                {daysToExam !== null && (
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    {daysToExam > 0
                      ? `${daysToExam} dager til eksamen`
                      : daysToExam === 0
                      ? "Eksamen i dag!"
                      : "Eksamen er over"}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Ingen eksamensdato satt
              </p>
            )}
          </div>
        )}
      </div>

      {/* Goals section */}
      <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            🎯 Mål
          </h4>
          <button
            onClick={() => setShowGoalForm(!showGoalForm)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showGoalForm ? "Avbryt" : "+ Legg til"}
          </button>
        </div>

        {showGoalForm && (
          <div className="mb-4 space-y-3">
            <input
              type="text"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="F.eks. Bestå eksamen med B eller bedre"
            />
            <button
              onClick={handleAddGoal}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Legg til mål
            </button>
          </div>
        )}

        <div className="space-y-2">
          {goals.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Ingen mål lagt til ennå
            </p>
          ) : (
            goals.map((goal) => (
              <div
                key={goal.id}
                className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded flex justify-between items-center"
              >
                <p className="text-gray-900 dark:text-white">{goal.text}</p>
                <button
                  onClick={() => removeGoal(subjectId, goal.id)}
                  className="text-red-600 hover:text-red-700 text-sm ml-2"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pro features: Deadlines and Reading items */}
      {isPro && (
        <>
          {/* Similar structure for deadlines and reading items */}
        </>
      )}
    </div>
  );
}
```

---

## 3. Database Migration

### Create planner_goals table

```sql
-- Migration: Create planner_goals table
-- Replaces goals stored in memory

CREATE TABLE IF NOT EXISTS planner_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_planner_goals_subject ON planner_goals(subject_id);
CREATE INDEX idx_planner_goals_user ON planner_goals(user_id);

-- RLS policies
ALTER TABLE planner_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON planner_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON planner_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON planner_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON planner_goals FOR DELETE
  USING (auth.uid() = user_id);
```

### Update reading_items schema

```sql
-- Migration: Update reading_items to match frontend
-- Change 'title' to 'text' and 'progress' to 'completed'

ALTER TABLE reading_items
  RENAME COLUMN title TO text;

ALTER TABLE reading_items
  ADD COLUMN completed BOOLEAN DEFAULT FALSE;

ALTER TABLE reading_items
  DROP COLUMN IF EXISTS progress;

-- Update existing data
UPDATE reading_items SET completed = FALSE WHERE completed IS NULL;
```

---

## 4. Testing Patterns

### Store Unit Tests

```typescript
// store/__tests__/useSubjectsStore.test.ts
import { renderHook, act } from "@testing-library/react";
import { useSubjectsStore } from "../useSubjectsStore";
import { supabase } from "@/lib/supabaseClient";

jest.mock("@/lib/supabaseClient");

describe("useSubjectsStore", () => {
  beforeEach(() => {
    useSubjectsStore.getState().reset();
  });

  it("initializes with empty state", () => {
    const { result } = renderHook(() => useSubjectsStore());
    expect(result.current.subjects).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.initialized).toBe(false);
  });

  it("loads subjects successfully", async () => {
    const mockSubjects = [
      {
        id: "1",
        user_id: "user-1",
        name: "Math",
        semester: "Spring 2024",
        exam_date: "2024-06-01",
        created_at: "2024-01-01",
      },
    ];

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockSubjects, error: null }),
    });

    const { result } = renderHook(() => useSubjectsStore());

    await act(async () => {
      await result.current.loadSubjects("user-1");
    });

    expect(result.current.subjects).toHaveLength(1);
    expect(result.current.subjects[0].name).toBe("Math");
    expect(result.current.initialized).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it("handles load errors gracefully", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: "DB error" } }),
    });

    const { result } = renderHook(() => useSubjectsStore());

    await act(async () => {
      try {
        await result.current.loadSubjects("user-1");
      } catch (error) {
        // Expected
      }
    });

    expect(result.current.subjects).toEqual([]);
    expect(result.current.error).toBeTruthy();
    expect(result.current.initialized).toBe(true);
  });

  it("deduplicates concurrent loads", async () => {
    const mockSubjects = [{ id: "1", name: "Math" }];
    const mockFn = jest
      .fn()
      .mockResolvedValue({ data: mockSubjects, error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: mockFn,
    });

    const { result } = renderHook(() => useSubjectsStore());

    await act(async () => {
      // Fire two concurrent loads
      await Promise.all([
        result.current.loadSubjects("user-1"),
        result.current.loadSubjects("user-1"),
      ]);
    });

    // Should only call API once
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("caches loaded data", async () => {
    const mockSubjects = [{ id: "1", name: "Math" }];
    const mockFn = jest
      .fn()
      .mockResolvedValue({ data: mockSubjects, error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: mockFn,
    });

    const { result } = renderHook(() => useSubjectsStore());

    await act(async () => {
      await result.current.loadSubjects("user-1");
    });

    // Second load should use cache
    await act(async () => {
      await result.current.loadSubjects("user-1");
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
```

### Component Tests

```typescript
// components/subjects/__tests__/Oversikt.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Oversikt from "../Oversikt";
import { useSubjectsStore } from "@/store/useSubjectsStore";
import { usePlannerStore } from "@/store/usePlannerStore";

jest.mock("@/store/useSubjectsStore");
jest.mock("@/store/usePlannerStore");

describe("Oversikt", () => {
  const mockSubject = {
    id: "subject-1",
    userId: "user-1",
    name: "Math 101",
    examDate: "2024-06-01",
    createdAt: "2024-01-01",
  };

  beforeEach(() => {
    (useSubjectsStore as unknown as jest.Mock).mockReturnValue({
      subjects: [mockSubject],
    });

    (usePlannerStore as unknown as jest.Mock).mockReturnValue({
      plannerLiteBySubjectId: {
        "subject-1": {
          subjectId: "subject-1",
          examDate: "2024-06-01",
        },
      },
      goalsBySubjectId: {
        "subject-1": [],
      },
      setExamDate: jest.fn(),
      addGoal: jest.fn(),
      removeGoal: jest.fn(),
    });
  });

  it("renders subject name and exam date", () => {
    render(<Oversikt subjectId="subject-1" isPro={false} />);

    expect(screen.getByText("Oversikt")).toBeInTheDocument();
    expect(screen.getByText(/Eksamen/)).toBeInTheDocument();
  });

  it("shows error when subject not found", () => {
    (useSubjectsStore as unknown as jest.Mock).mockReturnValue({
      subjects: [],
    });

    render(<Oversikt subjectId="invalid-id" isPro={false} />);

    expect(screen.getByText(/Kunne ikke laste oversikt/)).toBeInTheDocument();
  });

  it("allows adding goals", async () => {
    const addGoalMock = jest.fn();
    (usePlannerStore as unknown as jest.Mock).mockReturnValue({
      plannerLiteBySubjectId: {
        "subject-1": { subjectId: "subject-1", examDate: "2024-06-01" },
      },
      goalsBySubjectId: { "subject-1": [] },
      addGoal: addGoalMock,
      setExamDate: jest.fn(),
      removeGoal: jest.fn(),
    });

    render(<Oversikt subjectId="subject-1" isPro={false} />);

    // Open goal form
    fireEvent.click(screen.getByText("+ Legg til"));

    // Fill in goal
    const input = screen.getByPlaceholderText(/Bestå eksamen/);
    fireEvent.change(input, { target: { value: "Pass with A" } });

    // Submit
    fireEvent.click(screen.getByText("Legg til mål"));

    await waitFor(() => {
      expect(addGoalMock).toHaveBeenCalledWith(
        "subject-1",
        expect.objectContaining({
          text: "Pass with A",
        })
      );
    });
  });
});
```

---

## 5. Error Boundary

```typescript
// components/ErrorBoundary.tsx
"use client";

import React, { Component, ReactNode } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error boundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Noe gikk galt
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {this.state.error?.message || "En uventet feil oppstod"}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Prøv igjen
              </button>
              <Link
                href="/"
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Gå til hjem
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Usage in layout

```typescript
// components/layout/ClientLayout.tsx (updated)
"use client";

import type { ReactNode } from "react";
import MainNav from "@/components/layout/MainNav";
import AuthProvider from "@/components/AuthProvider";
import AppInitializer from "@/components/AppInitializer";
import ErrorBoundary from "@/components/ErrorBoundary";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppInitializer />
        <MainNav />
        <main>{children}</main>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

---

## 6. Type Definitions

### planner.ts (updated)

```typescript
// types/planner.ts

export interface Goal {
  id: string;
  subjectId: string;
  text: string;
}

export interface Deadline {
  id: string;
  subjectId: string;
  title: string;
  dueDate: string; // ISO date
  type: "innlevering" | "prøve" | "prosjekt";
}

export interface ReadingItem {
  id: string;
  subjectId: string;
  text: string; // Changed from 'title'
  completed: boolean; // Changed from 'progress: number'
}

export interface PlannerLiteData {
  subjectId: string;
  examDate: string;
}

export interface PlannerProData {
  subjectId: string;
  examDate: string;
  deadlines: Deadline[];
  readingItems: ReadingItem[];
}
```

---

## Summary

This implementation guide provides:

1. **Concrete store implementations** with error handling and deduplication
2. **Component patterns** with proper guards and async handling
3. **Database migrations** to align schema with frontend
4. **Testing patterns** for stores and components
5. **Error boundaries** for graceful failure handling
6. **Type definitions** that match the database schema

All patterns follow the architectural principles defined in ARCHITECTURE_V2.md:
- Sequential initialization
- Clear data ownership
- Defensive guards at multiple layers
- Isolated, testable components
- Predictable state management

**Next steps:**
1. Review and approve the architecture
2. Implement stores one by one
3. Update components to use new patterns
4. Run database migrations
5. Add tests
6. Deploy and monitor
