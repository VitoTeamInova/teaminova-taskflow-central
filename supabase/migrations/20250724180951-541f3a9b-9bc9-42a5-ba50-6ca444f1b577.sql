-- Add cascade deletion for related tables to fix orphaned records
-- First, add foreign key constraints with CASCADE DELETE

-- Drop existing foreign keys if they exist (without CASCADE)
ALTER TABLE IF EXISTS related_tasks DROP CONSTRAINT IF EXISTS related_tasks_task_id_fkey;
ALTER TABLE IF EXISTS related_tasks DROP CONSTRAINT IF EXISTS related_tasks_related_task_id_fkey;
ALTER TABLE IF EXISTS update_log DROP CONSTRAINT IF EXISTS update_log_task_id_fkey;

-- Add proper foreign key constraints with CASCADE DELETE
ALTER TABLE related_tasks 
ADD CONSTRAINT related_tasks_task_id_fkey 
FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

ALTER TABLE related_tasks 
ADD CONSTRAINT related_tasks_related_task_id_fkey 
FOREIGN KEY (related_task_id) REFERENCES tasks(id) ON DELETE CASCADE;

ALTER TABLE update_log 
ADD CONSTRAINT update_log_task_id_fkey 
FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;