-- RLS updates to allow non-admin team members to change roles without delete, while protecting administrator role

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Team members can insert non-admin roles" ON public.user_roles;
DROP POLICY IF EXISTS "Team members can update non-admin roles" ON public.user_roles;

-- 1) Allow team members to INSERT non-admin roles
CREATE POLICY "Team members can insert non-admin roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  public.is_team_member(auth.uid())
  AND (
    public.has_role(auth.uid(), 'administrator'::app_role)
    OR role <> 'administrator'::app_role
  )
);

-- 2) Allow team members to UPDATE roles, but not set or modify administrator role unless they're admins
CREATE POLICY "Team members can update non-admin roles"
ON public.user_roles
FOR UPDATE
USING (
  public.is_team_member(auth.uid())
  AND (
    public.has_role(auth.uid(), 'administrator'::app_role)
    OR role <> 'administrator'::app_role
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'administrator'::app_role)
  OR role <> 'administrator'::app_role
);

-- Keep existing admin ALL policy for full control (including DELETE)
-- Existing policy: "Administrators can manage roles" remains unchanged
