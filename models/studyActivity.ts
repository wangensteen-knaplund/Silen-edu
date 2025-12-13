export interface StudyActivityDaily {
  id: string;
  userId: string;
  date: string; // ISO date string
  worked: boolean;
  wroteNotes: boolean;
  reviewed: boolean;
  quizTaken: boolean;
}

// Calculate intensity (0-4) based on activity
export function calculateIntensityForDay(activity: StudyActivityDaily): number {
  let intensity = 0;
  if (activity.worked) intensity++;
  if (activity.wroteNotes) intensity++;
  if (activity.reviewed) intensity++;
  if (activity.quizTaken) intensity++;
  return intensity;
}

// Placeholder functions for future implementation
export async function fetchStudyActivities(userId: string, startDate: string, endDate: string): Promise<StudyActivityDaily[]> {
  // This will be implemented with Supabase
  return [];
}

export async function upsertStudyActivity(activity: Omit<StudyActivityDaily, "id">): Promise<StudyActivityDaily | null> {
  // This will be implemented with Supabase
  return null;
}
