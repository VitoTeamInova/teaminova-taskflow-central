-- Fix foreign key constraint to allow user deletion when they are assigned to tasks
-- First drop the existing foreign key constraint
ALTER TABLE public.tasks 
DROP CONSTRAINT IF EXISTS tasks_assignee_id_fkey;

-- Recreate the foreign key constraint with SET NULL on delete
ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_assignee_id_fkey 
FOREIGN KEY (assignee_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;