-- Add a creator column to allow creators to update their tasks
-- 1) Schema changes
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS created_by_profile_id uuid;

-- 2) Foreign key constraint to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'tasks_created_by_profile_id_fkey'
  ) THEN
    ALTER TABLE public.tasks
      ADD CONSTRAINT tasks_created_by_profile_id_fkey
      FOREIGN KEY (created_by_profile_id)
      REFERENCES public.profiles(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 3) Backfill creator using current assignee where possible so at least the assignee can update
UPDATE public.tasks
SET created_by_profile_id = assignee_id
WHERE created_by_profile_id IS NULL AND assignee_id IS NOT NULL;

-- 4) Helpful index
CREATE INDEX IF NOT EXISTS idx_tasks_created_by_profile_id ON public.tasks(created_by_profile_id);

-- 5) RLS policy: creators can update their tasks
DROP POLICY IF EXISTS "Creators can update their tasks" ON public.tasks;
CREATE POLICY "Creators can update their tasks"
ON public.tasks
FOR UPDATE
USING (
  created_by_profile_id = (
    SELECT profiles.id FROM public.profiles
    WHERE profiles.user_id = auth.uid()
  )
);
