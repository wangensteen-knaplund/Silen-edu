-- Migration: Update study_activity table to match requirements
-- This updates the existing study_activity table to add activity_date and update activity_type values
-- Run this SQL in your Supabase SQL Editor

-- 1. Add activity_date column (derived from now())
ALTER TABLE study_activity 
ADD COLUMN IF NOT EXISTS activity_date DATE DEFAULT CURRENT_DATE NOT NULL;

-- 2. Create index on (user_id, subject_id, activity_date) for efficient querying
CREATE INDEX IF NOT EXISTS idx_study_activity_user_subject_date 
ON study_activity(user_id, subject_id, activity_date);

-- 3. Update the CHECK constraint to use new activity_type values
-- First, drop the old constraint if it exists
ALTER TABLE study_activity DROP CONSTRAINT IF EXISTS study_activity_event_type_check;

-- Add new constraint with updated values: "note", "curriculum", "quiz"
ALTER TABLE study_activity 
ADD CONSTRAINT study_activity_activity_type_check 
CHECK (event_type IN ('note', 'curriculum', 'quiz'));

-- Note: This migration assumes you want to keep the column name as 'event_type' 
-- for backward compatibility. If you want to rename it to 'activity_type', 
-- uncomment the following line (but be aware this will require updating all code):
-- ALTER TABLE study_activity RENAME COLUMN event_type TO activity_type;

-- 4. Optional: Update existing data to use new activity_type values
-- Uncomment these lines if you have existing data that needs migration:
-- UPDATE study_activity SET event_type = 'note' WHERE event_type IN ('note_created', 'note_updated');
-- UPDATE study_activity SET event_type = 'curriculum' WHERE event_type = 'curriculum_toggled';
-- UPDATE study_activity SET event_type = 'quiz' WHERE event_type = 'quiz_completed';

-- 5. Backfill activity_date for existing rows based on created_at
-- This ensures existing rows have the correct activity_date
UPDATE study_activity 
SET activity_date = DATE(created_at) 
WHERE activity_date IS NULL OR activity_date = CURRENT_DATE;
