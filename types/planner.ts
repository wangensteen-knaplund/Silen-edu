export interface PlannerLiteData {
  subjectId: string;
  examDate: string; // ISO date string
}

export interface Deadline {
  id: string;
  subjectId: string;
  title: string;
  dueDate: string; // ISO date string
  type: "innlevering" | "prøve" | "prosjekt";
}

export interface ReadingItem {
  id: string;
  subjectId: string;
  text: string;
  completed: boolean;
}

export interface PlannerProData {
  subjectId: string;
  examDate: string;
  deadlines: Deadline[];
  readingItems: ReadingItem[];
}

export interface Goal {
  id: string;
  subjectId: string;
  text: string;
}
