-- Add missing foreign keys and helpful indexes for issues
BEGIN;

-- Author must exist in profiles; prevent orphan author rows
ALTER TABLE public.issues
  ADD CONSTRAINT issues_author_id_fkey
  FOREIGN KEY (author_id)
  REFERENCES public.profiles(id)
  ON DELETE RESTRICT;

-- Owner is optional; nullify on owner profile deletion
ALTER TABLE public.issues
  ADD CONSTRAINT issues_owner_id_fkey
  FOREIGN KEY (owner_id)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_issues_project_id ON public.issues(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_author_id ON public.issues(author_id);
CREATE INDEX IF NOT EXISTS idx_issues_owner_id ON public.issues(owner_id);
CREATE INDEX IF NOT EXISTS idx_issues_date_identified ON public.issues(date_identified);

COMMIT;