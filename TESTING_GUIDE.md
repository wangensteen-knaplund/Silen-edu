# Testing Guide: Curriculum → Notes → Study Activity → Dashboard Loop

This guide walks you through testing the newly implemented curriculum tracking system.

## Prerequisites

⚠️ **IMPORTANT**: You must run the database migration first!

1. Open your Supabase project
2. Go to SQL Editor
3. Copy the contents of `supabase-migrations.sql`
4. Execute the SQL script
5. Verify no errors occurred

## Test Scenario 1: Add Curriculum to a Subject

### Steps:
1. Navigate to Dashboard
2. Click on any subject card (or create a new subject if none exist)
3. Scroll down to the "📖 Pensum / Lesefremgang" section
4. Click "+ Legg til"
5. Paste multi-line curriculum text, for example:
   ```
   Kapittel 1: Introduksjon
   Kapittel 2: Teori og praksis
   Kapittel 3: Avanserte emner
   Artikkel: Machine Learning Basics
   ```
6. Click "Legg til pensum"

### Expected Results:
- ✅ Each line should appear as a curriculum item with a checkbox
- ✅ Progress bar should show "0 av 4 fullført"
- ✅ Progress bar percentage should be 0%

## Test Scenario 2: Complete Curriculum Items

### Steps:
1. Check/uncheck curriculum items by clicking their checkboxes
2. Watch the progress bar update in real-time
3. Check 2 out of 4 items

### Expected Results:
- ✅ Checked items should have strikethrough text
- ✅ Progress bar should update immediately
- ✅ Progress should show "2 av 4 fullført" and 50%
- ✅ Study activity event recorded (check `study_activity` table in Supabase if desired)

## Test Scenario 3: Create Note from Subject Card

### Steps:
1. Go back to Dashboard
2. Find the subject you just added curriculum to
3. Click the "+ Notat" button on the subject card
4. Verify subject dropdown is pre-filled
5. Enter a title: "Test note from subject"
6. Enter content: "This is a test note created from the subject card."
7. Click "Lagre notat"

### Expected Results:
- ✅ Subject is pre-selected in dropdown
- ✅ Note saves successfully
- ✅ Redirects to notes list
- ✅ Study activity recorded (last studied will update)

## Test Scenario 4: Create Note from Curriculum Line

### Steps:
1. Navigate back to the subject detail page
2. Find the curriculum list
3. Click the small "+ Notat" button next to any curriculum item (e.g., "Kapittel 1: Introduksjon")
4. Verify subject dropdown is pre-filled
5. Enter title: "Notes on Kapittel 1"
6. Enter content: "These are my notes for the first chapter."
7. Click "Lagre notat"

### Expected Results:
- ✅ Subject is pre-selected in dropdown
- ✅ Note saves successfully
- ✅ Note is linked to that curriculum item (check database: `notes.curriculum_item_id` should be set)
- ✅ Study activity recorded

## Test Scenario 5: Verify Dashboard Updates

### Steps:
1. Navigate to Dashboard
2. Find the subject card you've been working with

### Expected Results:
- ✅ Curriculum progress shows correct percentage (e.g., "50 %" if 2/4 completed)
- ✅ Progress bar visual matches percentage
- ✅ "Last studied" shows recent activity, e.g.:
  - "Sist jobbet: i dag" (if you did activities today)
  - "Sist jobbet: i går" (if last activity was yesterday)
  - "Sist jobbet: for X dager siden" (for older activities)
- ✅ If no curriculum added: "Ingen pensum lagt til enda"
- ✅ If no activity: "Ikke jobbet med ennå"

## Test Scenario 6: Notes Without Curriculum Link

### Steps:
1. Click "+ Notat" on a subject card
2. Don't select a curriculum item (since we're coming from the card, not a curriculum line)
3. Create a normal note
4. Save it

### Expected Results:
- ✅ Note saves successfully
- ✅ Note is NOT linked to any curriculum item (`curriculum_item_id` is NULL)
- ✅ This is expected behavior - not all notes need curriculum links
- ✅ Study activity still recorded

## Test Scenario 7: Empty States

### Steps:
1. Create a brand new subject with no curriculum
2. View the subject detail page
3. View the Dashboard

### Expected Results:
- ✅ Subject detail page shows "Ingen pensum lagt til ennå"
- ✅ Dashboard card shows "Ingen pensum lagt til enda"
- ✅ Dashboard card shows "Ikke jobbet med ennå" (no activity)
- ✅ "+ Notat" button still works

## Database Verification (Optional)

If you want to verify data is being stored correctly:

1. Open Supabase → Table Editor
2. Check `curriculum_items` table:
   - Should see your curriculum entries
   - `completed` field should match checkbox states
3. Check `study_activity` table:
   - Should see events with type `note_created` and `curriculum_toggled`
   - Each event has `subject_id`, `user_id`, and `created_at`
4. Check `notes` table:
   - Notes created from curriculum lines should have `curriculum_item_id` set
   - Notes created from subject cards should have `curriculum_item_id` as NULL

## Troubleshooting

### "Table does not exist" errors
- Solution: Run `supabase-migrations.sql` in Supabase SQL Editor

### Progress bar not updating
- Check browser console for errors
- Verify RLS policies are set correctly
- Ensure user is authenticated

### "Ikke jobbet med ennå" when you have activity
- Check that `study_activity` table has rows for your user_id and subject_id
- Verify `created_at` timestamps are recent
- Try refreshing the page

### Curriculum items not saving
- Check Supabase logs for errors
- Verify RLS policies allow INSERT
- Ensure you're logged in

## Success Criteria

You've successfully tested the implementation if:
- ✅ Curriculum can be added, completed, and deleted
- ✅ Progress bar updates correctly based on curriculum completion
- ✅ Notes can be created from both subject cards and curriculum lines
- ✅ Study activity is tracked automatically
- ✅ Dashboard shows derived data (curriculum progress + last studied)
- ✅ Creating notes from curriculum lines links them correctly
- ✅ Creating notes from subject cards works without curriculum link
- ✅ Empty states display correctly

## Next Steps

Once testing is complete:
- Add curriculum to all your subjects
- Link notes to curriculum items as you study
- Use the dashboard to track your progress across subjects
- The "last studied" indicator helps you identify subjects that need attention

## Need Help?

See `IMPLEMENTATION_SUMMARY.md` for:
- Detailed architecture decisions
- Complete list of changes
- Data flow diagrams
- Security and performance considerations
