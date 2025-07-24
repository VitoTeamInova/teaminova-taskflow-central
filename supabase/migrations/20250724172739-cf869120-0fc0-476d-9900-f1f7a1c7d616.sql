-- Fix task deletion RLS policy 
DROP POLICY IF EXISTS "Assignees and project managers can delete tasks" ON public.tasks;

CREATE POLICY "Assignees and project managers can delete tasks" 
ON public.tasks 
FOR DELETE 
USING (
  assignee_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR 
  project_id IN (
    SELECT id FROM public.projects 
    WHERE project_manager_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- Fix user/profile deletion RLS policy
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND (p.access_level = 'admin' OR p.email = 'vito@teaminova.com')
  )
);

-- Create admin function to delete auth users (this requires admin service role)
CREATE OR REPLACE FUNCTION public.admin_delete_user(user_id_to_delete UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  requesting_user_profile profiles%ROWTYPE;
BEGIN
  -- Check if the requesting user is an admin
  SELECT * INTO requesting_user_profile 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  IF requesting_user_profile.access_level != 'admin' AND requesting_user_profile.email != 'vito@teaminova.com' THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  
  -- Delete the profile first (this will cascade properly)
  DELETE FROM public.profiles WHERE user_id = user_id_to_delete;
  
  -- Note: Actual auth.users deletion requires service role key which isn't available in functions
  -- For now, we'll only delete the profile and let the admin manually clean up auth users if needed
  
  RETURN TRUE;
END;
$$;