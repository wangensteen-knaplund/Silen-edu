-- Create RPC function to get study activity for the last 7 days
-- This function returns aggregated activity counts per date for a given user
--
-- PREREQUISITES:
-- This function requires the activity_date column to exist in the study_activity table.
-- Run supabase-study-activity-update.sql first if you haven't already.

CREATE OR REPLACE FUNCTION get_study_activity_last_7_days(p_user_id UUID)
RETURNS TABLE (
  activity_date DATE,
  activity_count BIGINT
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    activity_date,
    COUNT(*) as activity_count
  FROM study_activity
  WHERE user_id = p_user_id
    AND activity_date >= CURRENT_DATE - INTERVAL '6 days'
    AND activity_date <= CURRENT_DATE
  GROUP BY activity_date
  ORDER BY activity_date ASC;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_study_activity_last_7_days(UUID) TO authenticated;
