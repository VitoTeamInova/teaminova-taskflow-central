-- Allow admins to update any task to avoid permission-related update failures
-- Note: RLS policies are permissive (OR). This keeps existing restrictions while granting admins access.

-- Drop the policy if it exists
DROP POLICY IF EXISTS "Admins can update any task" ON public.tasks;

-- Create new policy for admin task updates
CREATE POLICY "Admins can update any task"
ON public.tasks
FOR UPDATE
USING (public.is_admin());