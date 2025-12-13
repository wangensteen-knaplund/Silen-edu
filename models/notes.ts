import { Note, NoteTag } from "@/types/data";

// Model functions for notes
export type { Note, NoteTag };

// Placeholder functions for future implementation
export async function fetchNotes(userId: string, subjectId?: string): Promise<Note[]> {
  // This will be implemented with Supabase
  return [];
}

export async function fetchNoteById(id: string): Promise<Note | null> {
  // This will be implemented with Supabase
  return null;
}

export async function createNote(note: Omit<Note, "id" | "createdAt">): Promise<Note | null> {
  // This will be implemented with Supabase
  return null;
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
  // This will be implemented with Supabase
  return null;
}

export async function deleteNote(id: string): Promise<boolean> {
  // This will be implemented with Supabase
  return false;
}
