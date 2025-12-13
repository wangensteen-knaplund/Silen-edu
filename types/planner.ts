export interface PlannerLiteData {
  subjectId: string;
  examDate: string; // ISO date string
}

export interface Deadline {
  id: string;
  subjectId: string;
  title: string;
  dueDate: string; // ISO date string
  type: string; // e.g., "assignment", "exam", "presentation"
}

export interface ReadingItem {
  id: string;
  subjectId: string;
  title: string;
  progress: number; // 0-100
}

export interface PlannerProData {
  subjectId: string;
  examDate: string;
  deadlines: Deadline[];
  readingItems: ReadingItem[];
}
