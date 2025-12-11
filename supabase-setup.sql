-- StudyApp Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table is handled by Supabase Auth automatically

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  public_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study plan table
CREATE TABLE IF NOT EXISTS study_plan (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  goal TEXT,
  weeks_left INTEGER DEFAULT 0,
  weekly_plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subject_id)
);

-- AI history table
CREATE TABLE IF NOT EXISTS ai_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_subject_id ON notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_public_id ON notes(public_id);
CREATE INDEX IF NOT EXISTS idx_study_plan_user_id ON study_plan(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plan_subject_id ON study_plan(subject_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_user_id ON ai_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_note_id ON ai_history(note_id);

-- Enable Row Level Security (RLS)
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own subjects" ON subjects;
DROP POLICY IF EXISTS "Users can create their own subjects" ON subjects;
DROP POLICY IF EXISTS "Users can update their own subjects" ON subjects;
DROP POLICY IF EXISTS "Users can delete their own subjects" ON subjects;

DROP POLICY IF EXISTS "Users can view their own notes" ON notes;
DROP POLICY IF EXISTS "Anyone can view public notes" ON notes;
DROP POLICY IF EXISTS "Users can create their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

DROP POLICY IF EXISTS "Users can view their own study plans" ON study_plan;
DROP POLICY IF EXISTS "Users can create their own study plans" ON study_plan;
DROP POLICY IF EXISTS "Users can update their own study plans" ON study_plan;
DROP POLICY IF EXISTS "Users can delete their own study plans" ON study_plan;

DROP POLICY IF EXISTS "Users can view their own AI history" ON ai_history;
DROP POLICY IF EXISTS "Users can create their own AI history" ON ai_history;

-- Subjects policies
CREATE POLICY "Users can view their own subjects" ON subjects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subjects" ON subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subjects" ON subjects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subjects" ON subjects
  FOR DELETE USING (auth.uid() = user_id);

-- Notes policies
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public notes" ON notes
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create their own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Study plan policies
CREATE POLICY "Users can view their own study plans" ON study_plan
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study plans" ON study_plan
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study plans" ON study_plan
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study plans" ON study_plan
  FOR DELETE USING (auth.uid() = user_id);

-- AI history policies
CREATE POLICY "Users can view their own AI history" ON ai_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI history" ON ai_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_study_plan_updated_at ON study_plan;
CREATE TRIGGER update_study_plan_updated_at
    BEFORE UPDATE ON study_plan
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
