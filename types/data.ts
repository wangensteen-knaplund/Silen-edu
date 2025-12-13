export interface Subject {
  id: string;
  userId: string;
  name: string;
  semester?: string;
  examDate?: string; // ISO date string
  createdAt?: string;
}

export interface Note {
  id: string;
  subjectId: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface NoteTag {
  noteId: string;
  tagId: string;
}
