-- Create enum for issue severity
CREATE TYPE public.issue_severity AS ENUM ('critical', 'high', 'medium', 'low');

-- Create enum for issue status
CREATE TYPE public.issue_status AS ENUM ('open', 'under_investigation', 'being_worked', 'closed');

-- Create enum for issue item type
CREATE TYPE public.issue_item_type AS ENUM ('issue', 'bug', 'dependency', 'blocker', 'risk', 'other');

-- Create issues table
CREATE TABLE public.issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  date_identified DATE NOT NULL DEFAULT CURRENT_DATE,
  severity issue_severity NOT NULL,
  item_type issue_item_type NOT NULL,
  status issue_status NOT NULL DEFAULT 'open',
  description TEXT NOT NULL,
  owner_id UUID,
  target_resolution_date DATE,
  recommended_action TEXT,
  comments TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can view issues
CREATE POLICY "Users can view all issues"
  ON public.issues
  FOR SELECT
  USING (true);

-- All authenticated users can create issues
CREATE POLICY "Authenticated users can create issues"
  ON public.issues
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only author can update their own issues
CREATE POLICY "Authors can update their own issues"
  ON public.issues
  FOR UPDATE
  USING (author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Only administrators can delete issues
CREATE POLICY "Administrators can delete issues"
  ON public.issues
  FOR DELETE
  USING (has_role(auth.uid(), 'administrator'));

-- Add trigger for updated_at
CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();