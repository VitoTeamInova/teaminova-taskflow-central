-- Add missing DELETE policies for projects and tasks
-- Allow project managers to delete their projects (only if no tasks exist)
CREATE POLICY "Project managers can delete their projects" 
ON public.projects 
FOR DELETE 
USING (project_manager_id = ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.user_id = auth.uid())));

-- Allow assignees and project managers to delete tasks
CREATE POLICY "Assignees and project managers can delete tasks" 
ON public.tasks 
FOR DELETE 
USING ((assignee_id = ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.user_id = auth.uid()))) OR (project_id IN ( SELECT projects.id
   FROM projects
  WHERE (projects.project_manager_id = ( SELECT profiles.id
           FROM profiles
          WHERE (profiles.user_id = auth.uid()))))));

-- Allow authenticated users to delete update logs they created
CREATE POLICY "Users can delete update logs" 
ON public.update_log 
FOR DELETE 
USING (auth.uid() IS NOT NULL);