-- Fix foreign key constraint to allow user deletion when they are a project manager
-- First drop the existing foreign key constraint
ALTER TABLE public.projects 
DROP CONSTRAINT IF EXISTS projects_project_manager_id_fkey;

-- Recreate the foreign key constraint with SET NULL on delete
ALTER TABLE public.projects 
ADD CONSTRAINT projects_project_manager_id_fkey 
FOREIGN KEY (project_manager_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;