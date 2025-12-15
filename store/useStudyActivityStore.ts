"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { StudyActivity } from "@/types/data";

interface StudyActivityStore {
  // Track most recent activity per subject for quick access
  lastActivityBySubject: Record<string, string>; // subjectId -> ISO timestamp
  
  trackStudyActivity: (
    userId: string,
    subjectId: string,
    activityType: 'note' | 'curriculum' | 'quiz'
  ) => Promise<void>;
  
  loadLastActivityForSubject: (
    userId: string,
    subjectId: string
  ) => Promise<string | null>;
  
  loadLastActivityForAllSubjects: (
    userId: string,
    subjectIds: string[]
  ) => Promise<Record<string, string>>;
  
  reset: () => void;
}

export const useStudyActivityStore = create<StudyActivityStore>((set, get) => {
  const trackStudyActivity = async (
    userId: string,
    subjectId: string,
    activityType: 'note' | 'curriculum' | 'quiz'
  ): Promise<void> => {
    // Safety rule: silently do nothing if required params are missing
    if (!userId || !subjectId) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from("study_activity")
        .insert([
          {
            user_id: userId,
            subject_id: subjectId,
            event_type: activityType, // using event_type column name for backward compatibility
          },
        ])
        .select("id, user_id, subject_id, event_type, activity_date, created_at")
        .single();

      if (error || !data) {
        // Never throw - just log and return
        console.error("Error tracking study activity:", error);
        return;
      }

      // Update local cache for quick access
      set((state) => ({
        lastActivityBySubject: {
          ...state.lastActivityBySubject,
          [subjectId]: data.created_at,
        },
      }));
    } catch (err) {
      // Catch any unexpected errors and log them, but never throw
      console.error("Unexpected error tracking study activity:", err);
    }
  };

  const loadLastActivityForSubject = async (
    userId: string,
    subjectId: string
  ): Promise<string | null> => {
    if (!userId || !subjectId) return null;

    // Check cache first
    const cached = get().lastActivityBySubject[subjectId];
    if (cached) return cached;

    const { data, error } = await supabase
      .from("study_activity")
      .select("created_at")
      .eq("user_id", userId)
      .eq("subject_id", subjectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      // No activity found is not an error
      return null;
    }

    const timestamp = data.created_at;
    
    // Update cache
    set((state) => ({
      lastActivityBySubject: {
        ...state.lastActivityBySubject,
        [subjectId]: timestamp,
      },
    }));

    return timestamp;
  };

  const loadLastActivityForAllSubjects = async (
    userId: string,
    subjectIds: string[]
  ): Promise<Record<string, string>> => {
    if (!userId || subjectIds.length === 0) return {};

    // Use a single query to get the most recent activity for each subject
    const { data, error } = await supabase
      .from("study_activity")
      .select("subject_id, created_at")
      .eq("user_id", userId)
      .in("subject_id", subjectIds)
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("Error loading study activities:", error);
      return {};
    }

    // Build a map of subjectId -> most recent timestamp
    const result: Record<string, string> = {};
    for (const row of data) {
      if (!result[row.subject_id]) {
        result[row.subject_id] = row.created_at;
      }
    }

    // Update cache
    set((state) => ({
      lastActivityBySubject: {
        ...state.lastActivityBySubject,
        ...result,
      },
    }));

    return result;
  };

  return {
    lastActivityBySubject: {},
    trackStudyActivity,
    loadLastActivityForSubject,
    loadLastActivityForAllSubjects,
    reset: () => set({ lastActivityBySubject: {} }),
  };
});
