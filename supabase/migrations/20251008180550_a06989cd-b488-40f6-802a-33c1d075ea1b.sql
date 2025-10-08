-- Add reference_url column to tasks for shareable URLs
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS reference_url text;