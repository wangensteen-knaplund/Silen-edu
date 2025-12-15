export interface Subject {
  id: string;
  userId: string;
  name: string;
  semester?: string;
  examDate?: string; // ISO date string
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  content: string;
  isPublic: boolean;
  publicId: string | null;
  curriculumItemId?: string | null; // Optional link to curriculum item
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface NoteTag {
  noteId: string;
  tagId: string;
}

export interface CurriculumItem {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface StudyActivity {
  id: string;
  userId: string;
  subjectId: string;
  activityType: 'note' | 'curriculum' | 'quiz';
  activityDate: string; // ISO date string (YYYY-MM-DD)
  createdAt: string; // ISO timestamp
}
