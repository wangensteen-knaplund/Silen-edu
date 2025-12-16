# Heatmap Read Support Implementation

## Overview

This implementation adds read support for study activity heatmap on the dashboard. It displays the last 7 days of study activity in a visual heatmap format.

## Changes Made

### 1. Database RPC Function

**File:** `supabase-rpc-get-study-activity-last-7-days.sql`

Created a new Supabase RPC function `get_study_activity_last_7_days` that:
- Takes a user_id parameter
- Returns aggregated activity counts per date for the last 7 days
- Returns data in format: `{ activity_date: DATE, activity_count: BIGINT }[]`

**To Deploy:**
Run this SQL in your Supabase SQL Editor:
```bash
psql -f supabase-rpc-get-study-activity-last-7-days.sql
```

Or copy and paste the contents directly into the Supabase SQL Editor.

### 2. Store Updates

**File:** `store/useStudyActivityStore.ts`

Added new method `getStudyActivityLast7Days`:
- Calls the RPC function via Supabase client
- Returns activity data for the last 7 days
- Handles errors gracefully (returns empty array on error)
- No refactoring of existing store methods

### 3. Utility Functions

**File:** `utils/heatmap.ts`

Added `mapActivityToHeatmap` function:
- Takes raw activity data from the database
- Maps it to a 7-element array representing the last 7 days
- Uses simple intensity logic:
  - `0` = no activity
  - `1` = active day (1+ activities)
- Generates dates for the last 7 days (today - 6 to today)

### 4. Dashboard Integration

**File:** `app/dashboard/page.tsx`

Updated the dashboard to:
- Import `StudyHeatmapStrip` component (already existed)
- Import `mapActivityToHeatmap` utility
- Add state for heatmap intensities
- Fetch activity data on dashboard load via `useEffect`
- Display heatmap component above subject cards

## Features

### Visual Display
- Shows a horizontal strip of 7 cells (one per day)
- Days are labeled: Ma, Ti, On, To, Fr, Lø, Sø (Monday-Sunday in Norwegian)
- Color coding:
  - Light gray: No activity
  - Light blue: Activity detected
- Tooltip shows day name and activity count on hover

### Data Flow
1. User loads dashboard
2. `getStudyActivityLast7Days` fetches data from Supabase RPC
3. `mapActivityToHeatmap` transforms data into 7-day intensity array
4. `StudyHeatmapStrip` renders the visual heatmap

## Technical Details

### RPC Function Query
```sql
SELECT 
  activity_date,
  COUNT(*) as activity_count
FROM study_activity
WHERE user_id = p_user_id
  AND activity_date >= CURRENT_DATE - INTERVAL '6 days'
  AND activity_date <= CURRENT_DATE
GROUP BY activity_date
ORDER BY activity_date ASC;
```

### Date Mapping
- Generates last 7 days relative to today (rolling window)
- Matches activity dates to the generated date range
- Missing dates are filled with intensity `0`

### Error Handling
- RPC call failures return empty array (shows no activity)
- Console logs errors for debugging
- Never blocks UI or throws errors to user

## Testing

### Manual Testing Steps

1. **Verify RPC Function:**
   ```sql
   SELECT * FROM get_study_activity_last_7_days('YOUR_USER_ID');
   ```

2. **Verify Dashboard Load:**
   - Navigate to `/dashboard`
   - Check browser console for any errors
   - Verify heatmap appears above subject cards

3. **Verify Activity Tracking:**
   - Create a note, complete curriculum, or finish a quiz
   - Refresh the dashboard
   - Verify the current day shows activity (light blue)

4. **Verify Empty State:**
   - New users or users with no activity should see all gray cells

### Expected Behavior

- Heatmap loads when dashboard loads
- Shows last 7 days from today
- Updates when new activities are tracked
- Handles missing data gracefully
- Responsive and works on mobile

## Dependencies

- No new npm dependencies added
- Uses existing Supabase client
- Uses existing `StudyHeatmapStrip` component
- Uses existing `getHeatmapColor` utility

## Limitations (MVP)

- Simple intensity logic: only 0 or 1 (no gradual intensity based on count)
- No click interactions or drill-down
- No loading state displayed
- No day-of-week alignment (shows last 7 days rolling)
- No caching beyond component state

## Future Enhancements (Not Implemented)

- Gradual intensity based on activity count (0, 1-3, 4-6, 7-9, 10+)
- Click on a day to see activity details
- Weekly/monthly view toggle
- Activity breakdown by type (note, curriculum, quiz)
- Streak counter
- Loading skeleton while fetching data

## Files Changed

```
✅ supabase-rpc-get-study-activity-last-7-days.sql (NEW) - RPC function definition
✅ store/useStudyActivityStore.ts                  - Added getStudyActivityLast7Days
✅ utils/heatmap.ts                                - Added mapActivityToHeatmap
✅ app/dashboard/page.tsx                          - Integrated heatmap display
```

## Rollback

If you need to remove this feature:

1. Drop the RPC function:
   ```sql
   DROP FUNCTION IF EXISTS get_study_activity_last_7_days(UUID);
   ```

2. Revert code changes (remove the heatmap section from dashboard)

3. The store method can remain as it won't be called

## Success Criteria

- [x] RPC function returns correct data format
- [x] Store method calls RPC and handles errors
- [x] Utility maps data to 7-day array correctly
- [x] Dashboard displays heatmap on load
- [x] No breaking changes to existing functionality
- [x] TypeScript compiles without errors
- [x] Build succeeds
- [x] No new dependencies added
- [x] Minimal code changes

## Notes

- This implementation follows the "write-only" pattern established in `STUDY_ACTIVITY_TRACKING.md`
- The heatmap is now "read" enabled while keeping the write operations unchanged
- The implementation is minimal and focused on the MVP requirements
