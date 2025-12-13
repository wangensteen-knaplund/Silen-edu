import { Tag } from "@/types/data";

// Model functions for tags
export type { Tag };

// Placeholder functions for future implementation
export async function fetchTags(): Promise<Tag[]> {
  // This will be implemented with Supabase
  return [];
}

export async function createTag(name: string): Promise<Tag | null> {
  // This will be implemented with Supabase
  return null;
}

export async function fetchTagsForNote(noteId: string): Promise<Tag[]> {
  // This will be implemented with Supabase
  return [];
}

export async function addTagToNote(noteId: string, tagId: string): Promise<boolean> {
  // This will be implemented with Supabase
  return false;
}

export async function removeTagFromNote(noteId: string, tagId: string): Promise<boolean> {
  // This will be implemented with Supabase
  return false;
}
