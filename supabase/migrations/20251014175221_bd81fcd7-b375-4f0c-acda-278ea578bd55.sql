-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM (
  'administrator',
  'project_manager',
  'dev_lead',
  'developer',
  'product_owner',
  'team_member'
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Create function to check if user has any role (is a team member)
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  );
$$;

-- Migrate existing access_level data to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
  user_id,
  CASE 
    WHEN access_level = 'admin' THEN 'administrator'::app_role
    ELSE 'team_member'::app_role
  END
FROM public.profiles
WHERE user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Also add administrator role for vito@teaminova.com if not exists
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'administrator'::app_role
FROM public.profiles
WHERE email = 'vito@teaminova.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- RLS policies for user_roles table
CREATE POLICY "Users can view all roles"
ON public.user_roles
FOR SELECT
USING (true);

CREATE POLICY "Administrators can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'administrator'));

-- Drop old task RLS policies
DROP POLICY IF EXISTS "Admins can update any task" ON public.tasks;
DROP POLICY IF EXISTS "Assignees and project managers can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Creators can update their tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete tasks they created or are assigned to" ON public.tasks;

-- Create new task RLS policies
-- All team members can create, read, and update tasks
CREATE POLICY "Team members can view all tasks"
ON public.tasks
FOR SELECT
USING (true);

CREATE POLICY "Team members can create tasks"
ON public.tasks
FOR INSERT
WITH CHECK (public.is_team_member(auth.uid()));

CREATE POLICY "Team members can update tasks"
ON public.tasks
FOR UPDATE
USING (public.is_team_member(auth.uid()));

-- Only administrators can delete tasks
CREATE POLICY "Administrators can delete tasks"
ON public.tasks
FOR DELETE
USING (public.has_role(auth.uid(), 'administrator'));

-- Update profiles RLS policies
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update access levels" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Administrators can delete profiles"
ON public.profiles
FOR DELETE
USING (public.has_role(auth.uid(), 'administrator'));

CREATE POLICY "Administrators can update any profile"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'administrator'));

-- Update projects RLS policies to allow all team members
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Project managers can update their projects" ON public.projects;
DROP POLICY IF EXISTS "Project managers can delete their projects" ON public.projects;

CREATE POLICY "Team members can create projects"
ON public.projects
FOR INSERT
WITH CHECK (public.is_team_member(auth.uid()));

CREATE POLICY "Team members can update projects"
ON public.projects
FOR UPDATE
USING (public.is_team_member(auth.uid()));

CREATE POLICY "Administrators can delete projects"
ON public.projects
FOR DELETE
USING (public.has_role(auth.uid(), 'administrator'));