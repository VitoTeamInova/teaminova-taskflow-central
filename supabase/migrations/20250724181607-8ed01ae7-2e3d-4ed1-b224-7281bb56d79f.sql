-- Fix task deletion policy to allow project managers to delete tasks
DROP POLICY IF EXISTS "Assignees and project managers can delete tasks" ON tasks;

CREATE POLICY "Users can delete tasks they created or are assigned to" 
ON tasks 
FOR DELETE 
USING (
  -- Allow if user is the assignee
  assignee_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR
  -- Allow if user is the project manager
  project_id IN (
    SELECT id FROM projects 
    WHERE project_manager_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
  OR
  -- Allow admins to delete any task
  (SELECT access_level FROM profiles WHERE user_id = auth.uid()) = 'admin'
);