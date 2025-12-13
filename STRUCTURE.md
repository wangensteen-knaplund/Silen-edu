# Silen-Edu Project Structure Documentation

This document describes the clean structure setup for the Silen-Edu application, a Next.js + TypeScript + Supabase study tool for students.

## Overview

Silen-Edu is structured with clear separation of concerns:
- **Types**: TypeScript interfaces and types
- **Models**: Data access layer (placeholders for Supabase integration)
- **Stores**: Zustand state management
- **Utils**: Utility functions
- **Components**: Reusable React components
- **App**: Next.js App Router pages

## Directory Structure

```
├── app/                           # Next.js App Router pages
│   ├── layout.tsx                 # Root layout with MainNav
│   ├── page.tsx                   # Dashboard (home page)
│   ├── subjects/
│   │   ├── page.tsx               # Subject list
│   │   └── [subjectId]/
│   │       └── page.tsx           # Subject detail with planner
│   ├── notes/
│   │   ├── page.tsx               # Notes list with filters
│   │   ├── new/
│   │   │   └── page.tsx           # Create new note
│   │   └── [noteId]/
│   │       └── page.tsx           # Edit/view note
│   ├── quiz/
│   │   ├── page.tsx               # Quiz home
│   │   ├── type/
│   │   │   └── [subjectId]/
│   │   │       └── page.tsx       # Choose quiz type
│   │   ├── session/
│   │   │   └── [sessionId]/
│   │   │       └── page.tsx       # Quiz session
│   │   └── flashcards/
│   │       └── [subjectId]/
│   │           └── page.tsx       # Flashcards
│   └── settings/
│       ├── page.tsx               # Settings home
│       ├── account/
│       │   └── page.tsx           # Account settings
│       ├── appearance/
│       │   └── page.tsx           # Appearance settings
│       └── subscription/
│           └── page.tsx           # Subscription settings
│
├── components/                    # React components
│   ├── layout/
│   │   └── MainNav.tsx            # Main navigation
│   ├── dashboard/
│   │   └── StudyHeatmapStrip.tsx  # Weekly study activity heatmap
│   ├── subjects/
│   │   ├── PlannerLite.tsx        # Lite planner component
│   │   └── PlannerPro.tsx         # Pro planner component (placeholder)
│   ├── notes/
│   │   └── NoteCard.tsx           # Note card component
│   └── quiz/
│       ├── QuizTypeCard.tsx       # Quiz type selection card
│       └── Flashcard.tsx          # Flashcard component
│
├── lib/                           # Library code
│   ├── supabaseClient.ts          # Supabase client setup
│   └── ai/                        # AI placeholder layer
│       ├── interfaces.ts          # AI type definitions
│       ├── summaries.ts           # AI summary placeholder
│       └── quizGenerator.ts       # AI quiz generator placeholder
│
├── models/                        # Data models
│   ├── subjects.ts                # Subject model and functions
│   ├── notes.ts                   # Notes model and functions
│   ├── tags.ts                    # Tags model and functions
│   ├── studyActivity.ts           # Study activity model
│   ├── planner.ts                 # Planner model
│   └── quiz.ts                    # Quiz model
│
├── store/                         # Zustand stores
│   ├── useSubjectsStore.ts        # Subjects state management
│   ├── useNotesStore.ts           # Notes state management
│   ├── usePlannerStore.ts         # Planner state management
│   ├── useQuizStore.ts            # Quiz state management
│   └── useStudyTrackerStore.ts    # Study tracker state management
│
├── types/                         # TypeScript types
│   ├── data.ts                    # Core data types (Subject, Note, Tag)
│   ├── quiz.ts                    # Quiz types
│   └── planner.ts                 # Planner types
│
├── utils/                         # Utility functions
│   ├── date.ts                    # Date manipulation utilities
│   └── heatmap.ts                 # Heatmap color utilities
│
└── supabase-setup.sql             # Supabase database schema
```

## Key Features

### 1. Dashboard
- Greeting section
- Weekly study tracker with heatmap
- Subjects overview

### 2. Subjects Module
- List all subjects
- Subject detail page with:
  - Planner Lite (exam date countdown)
  - Planner Pro (placeholder for Pro features)
  - Quick links to notes and quiz

### 3. Notes Module
- List notes with filtering by subject
- Create/edit notes with:
  - Title, subject, tags, content
  - AI summary placeholder button
- Tag support (placeholder)

### 4. Study Tracker
- Visual heatmap showing weekly study activity
- Tracks: worked, wrote notes, reviewed, took quiz
- Color-coded intensity (0-4)

### 5. Quiz Module
- Quiz home (select subject)
- Quiz type selection:
  - Flashcards (Free)
  - Basic Multiple Choice (Free)
  - AI Multiple Choice (Pro placeholder)
  - AI Reflection (Pro placeholder)
- Quiz session with scoring
- Flashcards with flip functionality

### 6. Settings Module
- Account settings (placeholder)
- Appearance settings (placeholder)
- Subscription settings with Pro feature list

## AI Placeholder Layer

All AI functionality is currently a placeholder:
- `lib/ai/summaries.ts`: Returns placeholder text
- `lib/ai/quizGenerator.ts`: Returns empty array
- No real AI integration or API calls

## Zustand Stores

All stores contain placeholder data:
- Subjects store has 2 sample subjects
- Notes store has 1 sample note
- Study tracker has sample activity data
- No Supabase integration yet

## Database Schema

The `supabase-setup.sql` file defines all required tables:
- subjects (with exam_date, semester)
- notes (with title, content, tags)
- tags and note_tags
- study_activity_daily
- deadlines (Pro)
- reading_items (Pro)
- quiz_sessions

All tables have RLS policies configured.

## Pro Features (Not Implemented)

Features marked as "Pro" are placeholders:
- Planner Pro (deadlines, reading progress)
- AI-generated quiz questions
- AI-generated reflections
- AI note summarization

## What's NOT Implemented

As per requirements, the following are explicitly NOT included:
- Real AI integration
- Real authentication logic
- Real Supabase data fetching
- Subscription/payment logic
- Design system/Tailwind complexity
- Over-engineered business logic

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Set up Supabase (optional)
# Run the SQL in supabase-setup.sql in your Supabase SQL Editor
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Extension Points

To add real functionality:

1. **AI Integration**: Replace placeholder functions in `lib/ai/` with real API calls
2. **Supabase Integration**: Implement model functions in `models/`
3. **Authentication**: Add auth logic to protected routes
4. **Pro Features**: Implement subscription checks and unlock features
5. **Styling**: Add a design system (Tailwind utility classes already available)

## Navigation

The main navigation (`MainNav`) includes links to:
- Dashboard (`/`)
- Fag/Subjects (`/subjects`)
- Notater/Notes (`/notes`)
- Quiz (`/quiz`)
- Innstillinger/Settings (`/settings`)

## Code Quality

- TypeScript strict mode enabled
- All components are client components ("use client")
- Consistent naming conventions
- Clear separation of concerns
- Placeholder comments where AI/Pro features belong
