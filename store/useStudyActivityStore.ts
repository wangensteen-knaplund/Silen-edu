"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { StudyActivity } from "@/types/data";

interface StudyActivityStore {
  // Track most recent activity per subject for quick access
  lastActivityBySubject: Record<string, string>; // subjectId -> ISO timestamp
  
  recordActivity: (
    userId: string,
    subjectId: string,
    eventType: 'note_created' | 'note_updated' | 'curriculum_toggled'
  ) => Promise<StudyActivity | null>;
  
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
  const recordActivity = async (
    userId: string,
    subjectId: string,
    eventType: 'note_created' | 'note_updated' | 'curriculum_toggled'
  ): Promise<StudyActivity | null> => {
    if (!userId || !subjectId) return null;

    const { data, error } = await supabase
      .from("study_activity")
      .insert([
        {
          user_id: userId,
          subject_id: subjectId,
          event_type: eventType,
        },
      ])
      .select("id, user_id, subject_id, event_type, created_at")
      .single();

    if (error || !data) {
      console.error("Error recording study activity:", error);
      return null;
    }

    const activity: StudyActivity = {
      id: data.id,
      userId: data.user_id,
      subjectId: data.subject_id,
      eventType: data.event_type,
      createdAt: data.created_at,
    };

    // Update local cache
    set((state) => ({
      lastActivityBySubject: {
        ...state.lastActivityBySubject,
        [subjectId]: activity.createdAt,
      },
    }));

    return activity;
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
    recordActivity,
    loadLastActivityForSubject,
    loadLastActivityForAllSubjects,
    reset: () => set({ lastActivityBySubject: {} }),
  };
});
