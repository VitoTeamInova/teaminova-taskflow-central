-- Allow team members to view error logs (read-only)
-- This helps non-admin users see system errors on the dashboard
DROP POLICY IF EXISTS "Administrators can view all error logs" ON error_logs;

CREATE POLICY "Team members can view error logs"
ON error_logs
FOR SELECT
USING (is_team_member(auth.uid()));