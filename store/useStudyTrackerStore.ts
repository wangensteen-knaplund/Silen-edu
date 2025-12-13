import { create } from "zustand";
import { StudyActivityDaily, calculateIntensityForDay } from "@/models/studyActivity";
import { getCurrentWeekRange } from "@/utils/date";

interface StudyTrackerStore {
  activities: StudyActivityDaily[];
  setActivities: (activities: StudyActivityDaily[]) => void;
  addActivity: (activity: StudyActivityDaily) => void;
  getWeeklyIntensities: () => number[];
}

export const useStudyTrackerStore = create<StudyTrackerStore>((set, get) => ({
  activities: [
    // Placeholder data for current week
    {
      id: "act-1",
      userId: "user-1",
      date: "2024-12-09",
      worked: false,
      wroteNotes: false,
      reviewed: false,
      quizTaken: false,
    },
    {
      id: "act-2",
      userId: "user-1",
      date: "2024-12-10",
      worked: true,
      wroteNotes: false,
      reviewed: false,
      quizTaken: false,
    },
    {
      id: "act-3",
      userId: "user-1",
      date: "2024-12-11",
      worked: true,
      wroteNotes: true,
      reviewed: false,
      quizTaken: false,
    },
    {
      id: "act-4",
      userId: "user-1",
      date: "2024-12-12",
      worked: true,
      wroteNotes: true,
      reviewed: true,
      quizTaken: false,
    },
    {
      id: "act-5",
      userId: "user-1",
      date: "2024-12-13",
      worked: true,
      wroteNotes: false,
      reviewed: false,
      quizTaken: false,
    },
  ],
  setActivities: (activities) => set({ activities }),
  addActivity: (activity) =>
    set((state) => ({ activities: [...state.activities, activity] })),
  getWeeklyIntensities: () => {
    const { start, end } = getCurrentWeekRange();
    const activities = get().activities;
    
    // Create array of 7 days (Monday to Sunday)
    const intensities: number[] = [];
    const startDate = new Date(start);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      
      const activity = activities.find((a) => a.date === dateStr);
      if (activity) {
        intensities.push(calculateIntensityForDay(activity));
      } else {
        intensities.push(0);
      }
    }
    
    return intensities;
  },
}));
