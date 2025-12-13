import { create } from "zustand";
import { StudyActivityDaily, calculateIntensityForDay } from "@/models/studyActivity";
import { getCurrentWeekRange, getTodayISO } from "@/utils/date";

interface StudyTrackerStore {
  activities: Record<string, StudyActivityDaily>; // keyed by date
  registerWorkedToday: () => void;
  registerNoteEdited: () => void;
  registerQuizTaken: () => void;
  registerReviewed: () => void;
  getWeeklyIntensities: () => number[];
}

// Helper function to get or create activity for a date
function getOrCreateActivity(activities: Record<string, StudyActivityDaily>, date: string): StudyActivityDaily {
  return activities[date] || {
    id: `act-${date}`,
    userId: "user-1",
    date,
    worked: false,
    wroteNotes: false,
    reviewed: false,
    quizTaken: false,
  };
}

export const useStudyTrackerStore = create<StudyTrackerStore>((set, get) => ({
  activities: {},
  
  registerWorkedToday: () => {
    const today = getTodayISO();
    set((state) => {
      const existing = getOrCreateActivity(state.activities, today);
      return {
        activities: {
          ...state.activities,
          [today]: {
            ...existing,
            worked: true,
          },
        },
      };
    });
  },
  
  registerNoteEdited: () => {
    const today = getTodayISO();
    set((state) => {
      const existing = getOrCreateActivity(state.activities, today);
      return {
        activities: {
          ...state.activities,
          [today]: {
            ...existing,
            wroteNotes: true,
            worked: true, // Also mark as worked
          },
        },
      };
    });
  },
  
  registerQuizTaken: () => {
    const today = getTodayISO();
    set((state) => {
      const existing = getOrCreateActivity(state.activities, today);
      return {
        activities: {
          ...state.activities,
          [today]: {
            ...existing,
            quizTaken: true,
            worked: true, // Also mark as worked
          },
        },
      };
    });
  },
  
  registerReviewed: () => {
    const today = getTodayISO();
    set((state) => {
      const existing = getOrCreateActivity(state.activities, today);
      return {
        activities: {
          ...state.activities,
          [today]: {
            ...existing,
            reviewed: true,
            worked: true, // Also mark as worked
          },
        },
      };
    });
  },
  
  getWeeklyIntensities: () => {
    const { start } = getCurrentWeekRange();
    const activities = get().activities;
    
    // Create array of 7 days (Monday to Sunday)
    const intensities: number[] = [];
    const startDate = new Date(start);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      
      const activity = activities[dateStr];
      if (activity) {
        intensities.push(calculateIntensityForDay(activity));
      } else {
        intensities.push(0);
      }
    }
    
    return intensities;
  },
}));
