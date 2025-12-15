# Study Activity Tracking Implementation

## Overview

This document describes the **write-only study activity tracker** implemented in Silen-edu. This feature logs study events to enable future heatmap/analytics without affecting existing UI or user flows.

## Design Principles

1. **Write-only**: This implementation ONLY logs events - no UI, charts, or visualizations
2. **Non-blocking**: Tracking never blocks user actions (fire-and-forget pattern)
3. **Fail-safe**: Errors are logged but never thrown to the user
4. **Minimal**: No refactoring of existing stores or business logic
5. **Isolated**: Single responsibility store focused only on logging

## Database Schema

### Table: `study_activity`

```sql
CREATE TABLE study_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('note', 'curriculum', 'quiz')),
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_study_activity_user_id ON study_activity(user_id);
CREATE INDEX idx_study_activity_subject_id ON study_activity(subject_id);
CREATE INDEX idx_study_activity_created_at ON study_activity(created_at);
CREATE INDEX idx_study_activity_user_subject_date ON study_activity(user_id, subject_id, activity_date);
```

### Fields

- `id`: Unique identifier (UUID)
- `user_id`: Reference to the user who performed the activity
- `subject_id`: Reference to the subject the activity relates to
- `event_type`: Type of activity - one of:
  - `"note"` - Note was saved/created
  - `"curriculum"` - Curriculum item marked completed
  - `"quiz"` - Quiz completed
- `activity_date`: Date the activity occurred (derived from now(), indexed for heatmap queries)
- `created_at`: Exact timestamp when record was created

### Row Level Security

```sql
-- Users can only view their own activity
CREATE POLICY "Users can view their own study activity" ON study_activity
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only create their own activity
CREATE POLICY "Users can create their own study activity" ON study_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Implementation

### Core Function: `trackStudyActivity`

Location: `store/useStudyActivityStore.ts`

```typescript
trackStudyActivity: (
  userId: string,
  subjectId: string,
  activityType: 'note' | 'curriculum' | 'quiz'
) => Promise<void>
```

**Behavior:**
- Returns `Promise<void>` (not `Promise<StudyActivity>`) - fire and forget
- Silently returns if `userId` or `subjectId` is missing
- Catches all errors and logs them (never throws)
- Updates local cache on success (for quick "last activity" lookups)

### Integration Points

#### 1. Note Creation
**File:** `app/notes/new/page.tsx`  
**Location:** After successful note save  
**Call:** `trackStudyActivity(user.id, subjectId, 'note')`

```typescript
// Track study activity for note creation (fire and forget - never blocks user flow)
trackStudyActivity(user.id, subjectId, 'note');

router.push(`/notes?subjectId=${subjectId}`);
```

#### 2. Curriculum Item Completion
**File:** `components/subjects/Oversikt.tsx`  
**Location:** After curriculum item is toggled  
**Call:** `trackStudyActivity(user.id, subject.id, 'curriculum')`

```typescript
const updated = await toggleCurriculumItem(subject.id, itemId, user.id);
if (updated) {
  // Track study activity when curriculum item is marked completed (fire and forget)
  trackStudyActivity(user.id, subject.id, 'curriculum');
}
```

#### 3. Quiz Completion
**File:** `app/quiz/session/[sessionId]/page.tsx`  
**Location:** When user completes the last quiz question  
**Call:** `trackStudyActivity(session.userId, session.subjectId, 'quiz')`

```typescript
if (isLastQuestion) {
  setShowResult(true);
  // Track quiz completion (fire and forget - never blocks user flow)
  if (!quizCompleted && session.userId && session.subjectId) {
    trackStudyActivity(session.userId, session.subjectId, 'quiz');
    setQuizCompleted(true);
  }
  // Also register for local study tracker (for weekly heatmap if used)
  registerQuizTaken();
}
```

## Migration

To apply this implementation to an existing database, run:

```bash
# Run this in your Supabase SQL Editor
psql -f supabase-study-activity-update.sql
```

This migration:
1. Adds `activity_date` column with default value
2. Creates the composite index for efficient querying
3. Updates the CHECK constraint for new activity types
4. Backfills `activity_date` for existing rows

**Note:** The migration uses `event_type` as the column name (not `activity_type`) for backward compatibility with existing code. The TypeScript interface exposes it as `activityType`.

## What This Does NOT Do

❌ **No UI components** - No heatmaps, charts, or visualizations  
❌ **No aggregations** - No "days studied" or "streak" calculations  
❌ **No reading from the table** - Only writing (except for cache updates)  
❌ **No blocking user flows** - Tracking failures never interrupt user actions  
❌ **No changes to existing stores** - SubjectStore, NotesStore, CurriculumStore unchanged  

## Future Extensions (Not Implemented)

When you're ready to add visualizations, you can:

1. Create a new component (e.g., `StudyHeatmap.tsx`)
2. Query `study_activity` table grouped by `activity_date`
3. Display weekly/monthly activity patterns
4. Calculate streaks based on consecutive `activity_date` values

Example query for heatmap data:
```sql
SELECT 
  activity_date,
  COUNT(*) as activity_count,
  ARRAY_AGG(DISTINCT event_type) as activity_types
FROM study_activity
WHERE user_id = $1
  AND activity_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY activity_date
ORDER BY activity_date DESC;
```

## Testing

### Manual Testing Checklist

1. **Note Creation**
   - [ ] Create a new note
   - [ ] Verify no errors in console
   - [ ] Check `study_activity` table has new row with `event_type = 'note'`

2. **Curriculum Completion**
   - [ ] Toggle a curriculum item checkbox
   - [ ] Verify no errors in console
   - [ ] Check `study_activity` table has new row with `event_type = 'curriculum'`

3. **Quiz Completion**
   - [ ] Start and complete a quiz
   - [ ] Verify no errors in console
   - [ ] Check `study_activity` table has new row with `event_type = 'quiz'`

4. **Error Handling**
   - [ ] Test with invalid user_id (should fail silently)
   - [ ] Test with invalid subject_id (should fail silently)
   - [ ] Verify user flow continues normally even if tracking fails

### Database Query for Verification

```sql
-- View recent study activity
SELECT 
  id,
  user_id,
  subject_id,
  event_type,
  activity_date,
  created_at
FROM study_activity
ORDER BY created_at DESC
LIMIT 20;

-- Count activities by type
SELECT 
  event_type,
  COUNT(*) as count
FROM study_activity
GROUP BY event_type;
```

## Architecture Decision Record

### Why fire-and-forget pattern?

**Decision:** Use non-blocking calls (`trackStudyActivity()` without `await` in most places)

**Rationale:**
- Tracking should never slow down user actions
- Users shouldn't see errors if tracking fails
- The core functionality (saving notes, completing quizzes) is more important than activity logging

### Why a separate store?

**Decision:** Create dedicated `useStudyActivityStore` instead of adding to existing stores

**Rationale:**
- Single Responsibility Principle - tracking is a separate concern
- Easier to disable/remove if needed
- No risk of breaking existing store logic
- Clear separation between business logic and analytics

### Why these three events?

**Decision:** Track only "note", "curriculum", and "quiz" events

**Rationale:**
- These represent meaningful study actions (not just browsing)
- Easy to understand and explain to users
- Sufficient for basic activity heatmaps
- More events can be added later without breaking existing data

## Troubleshooting

### Problem: No rows in study_activity table

**Check:**
1. Is the migration applied? (`SELECT * FROM study_activity LIMIT 1`)
2. Are there console errors when actions are performed?
3. Is RLS enabled and blocking inserts? (Check RLS policies)

### Problem: Duplicate rows for same action

**Expected:** Each action (note save, quiz complete, etc.) creates ONE row.  
**If duplicates occur:**
- Check that the tracking call isn't in a render function
- Verify state updates aren't causing re-triggers

### Problem: Old event_type values still in use

**Solution:** The migration includes optional UPDATE statements (commented out) to convert old data.  
Uncomment and run:
```sql
UPDATE study_activity SET event_type = 'note' WHERE event_type IN ('note_created', 'note_updated');
UPDATE study_activity SET event_type = 'curriculum' WHERE event_type = 'curriculum_toggled';
UPDATE study_activity SET event_type = 'quiz' WHERE event_type = 'quiz_completed';
```

## Summary

This implementation provides a **boring, safe, isolated** logging system that:
- ✅ Tracks study events in an append-only table
- ✅ Never blocks or breaks user flows
- ✅ Requires minimal code changes
- ✅ Provides a foundation for future analytics

The data is stored and ready for visualization, but no UI components have been added to maintain the principle of minimal changes.
