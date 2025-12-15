-- Migration: Add curriculum items, study activity tracking, and link notes to curriculum
-- Run this SQL in your Supabase SQL Editor

-- 1. Create curriculum_items table (replaces the text/completed usage of reading_items)
CREATE TABLE IF NOT EXISTS curriculum_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create study_activity table for tracking study events
CREATE TABLE IF NOT EXISTS study_activity (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('note_created', 'note_updated', 'curriculum_toggled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add curriculum_item_id to notes table (nullable FK)
ALTER TABLE notes ADD COLUMN IF NOT EXISTS curriculum_item_id UUID REFERENCES curriculum_items(id) ON DELETE SET NULL;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_curriculum_items_user_id ON curriculum_items(user_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_items_subject_id ON curriculum_items(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_activity_user_id ON study_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_study_activity_subject_id ON study_activity(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_activity_created_at ON study_activity(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_curriculum_item_id ON notes(curriculum_item_id);

-- 5. Enable Row Level Security
ALTER TABLE curriculum_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_activity ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for curriculum_items
DROP POLICY IF EXISTS "Users can view their own curriculum items" ON curriculum_items;
DROP POLICY IF EXISTS "Users can manage their own curriculum items" ON curriculum_items;

CREATE POLICY "Users can view their own curriculum items" ON curriculum_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own curriculum items" ON curriculum_items
  FOR ALL USING (auth.uid() = user_id);

-- 7. Create RLS policies for study_activity
DROP POLICY IF EXISTS "Users can view their own study activity" ON study_activity;
DROP POLICY IF EXISTS "Users can create their own study activity" ON study_activity;

CREATE POLICY "Users can view their own study activity" ON study_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study activity" ON study_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Migration path for existing reading_items data
-- IMPORTANT: There is a discrepancy in the existing codebase:
--   - The supabase-setup.sql schema defines reading_items with 'title' and 'progress' fields
--   - The usePlannerStore.ts code queries for 'text' and 'completed' fields
--
-- This new curriculum_items table resolves this by explicitly using 'title' and 'completed'.
--
-- If your database somehow has reading_items with 'text' and 'completed' fields, migrate:
-- 
-- INSERT INTO curriculum_items (user_id, subject_id, title, completed, created_at)
-- SELECT user_id, subject_id, text as title, completed, created_at
-- FROM reading_items
-- WHERE text IS NOT NULL AND completed IS NOT NULL;
--
-- If your reading_items follows the schema (title/progress), you can convert:
--
-- INSERT INTO curriculum_items (user_id, subject_id, title, completed, created_at)
-- SELECT user_id, subject_id, title, (progress = 100) as completed, created_at
-- FROM reading_items
-- WHERE title IS NOT NULL;
--
-- Note: Only run ONE of the above migrations based on your actual table structure.
-- Check your reading_items columns first: SELECT * FROM reading_items LIMIT 1;
