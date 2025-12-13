-- Silen-Edu Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table is handled by Supabase Auth automatically

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  semester TEXT,
  exam_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Note tags junction table
CREATE TABLE IF NOT EXISTS note_tags (
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (note_id, tag_id)
);

-- Study activity daily table
CREATE TABLE IF NOT EXISTS study_activity_daily (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  worked BOOLEAN DEFAULT FALSE,
  wrote_notes BOOLEAN DEFAULT FALSE,
  reviewed BOOLEAN DEFAULT FALSE,
  quiz_taken BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Deadlines table (Pro feature)
CREATE TABLE IF NOT EXISTS deadlines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reading items table (Pro feature)
CREATE TABLE IF NOT EXISTS reading_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz sessions table
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  questions JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Study plan table (legacy - keeping for compatibility)
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
CREATE INDEX IF NOT EXISTS idx_note_tags_note_id ON note_tags(note_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_tag_id ON note_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_study_activity_user_id ON study_activity_daily(user_id);
CREATE INDEX IF NOT EXISTS idx_study_activity_date ON study_activity_daily(date);
CREATE INDEX IF NOT EXISTS idx_deadlines_user_id ON deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_subject_id ON deadlines(subject_id);
CREATE INDEX IF NOT EXISTS idx_reading_items_user_id ON reading_items(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_items_subject_id ON reading_items(subject_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_subject_id ON quiz_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_plan_user_id ON study_plan(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plan_subject_id ON study_plan(subject_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_user_id ON ai_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_note_id ON ai_history(note_id);

-- Enable Row Level Security (RLS)
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_activity_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own subjects" ON subjects;
DROP POLICY IF EXISTS "Users can create their own subjects" ON subjects;
DROP POLICY IF EXISTS "Users can update their own subjects" ON subjects;
DROP POLICY IF EXISTS "Users can delete their own subjects" ON subjects;

DROP POLICY IF EXISTS "Users can view their own notes" ON notes;
DROP POLICY IF EXISTS "Users can create their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

DROP POLICY IF EXISTS "Anyone can view tags" ON tags;
DROP POLICY IF EXISTS "Users can create tags" ON tags;

DROP POLICY IF EXISTS "Users can view note tags" ON note_tags;
DROP POLICY IF EXISTS "Users can manage note tags" ON note_tags;

DROP POLICY IF EXISTS "Users can view their own activity" ON study_activity_daily;
DROP POLICY IF EXISTS "Users can manage their own activity" ON study_activity_daily;

DROP POLICY IF EXISTS "Users can view their own deadlines" ON deadlines;
DROP POLICY IF EXISTS "Users can manage their own deadlines" ON deadlines;

DROP POLICY IF EXISTS "Users can view their own reading items" ON reading_items;
DROP POLICY IF EXISTS "Users can manage their own reading items" ON reading_items;

DROP POLICY IF EXISTS "Users can view their own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can manage their own quiz sessions" ON quiz_sessions;

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
  FOR SELECT USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM subjects
      WHERE subjects.id = notes.subject_id
        AND subjects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own notes" ON notes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM subjects
      WHERE subjects.id = notes.subject_id
        AND subjects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Tags policies
CREATE POLICY "Anyone can view tags" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Users can create tags" ON tags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Note tags policies
CREATE POLICY "Users can view note tags" ON note_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM notes WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage note tags" ON note_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM notes WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid()
    )
  );

-- Study activity policies
CREATE POLICY "Users can view their own activity" ON study_activity_daily
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own activity" ON study_activity_daily
  FOR ALL USING (auth.uid() = user_id);

-- Deadlines policies
CREATE POLICY "Users can view their own deadlines" ON deadlines
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own deadlines" ON deadlines
  FOR ALL USING (auth.uid() = user_id);

-- Reading items policies
CREATE POLICY "Users can view their own reading items" ON reading_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own reading items" ON reading_items
  FOR ALL USING (auth.uid() = user_id);

-- Quiz sessions policies
CREATE POLICY "Users can view their own quiz sessions" ON quiz_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own quiz sessions" ON quiz_sessions
  FOR ALL USING (auth.uid() = user_id);

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
