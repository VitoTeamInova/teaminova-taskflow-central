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

-- Create admin function to delete users properly
CREATE OR REPLACE FUNCTION public.admin_delete_user(user_id_to_delete UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  requesting_user_email TEXT;
  requesting_user_access_level TEXT;
BEGIN
  -- Check if the requesting user is an admin
  SELECT email, access_level INTO requesting_user_email, requesting_user_access_level
  FROM profiles 
  WHERE user_id = auth.uid();
  
  IF requesting_user_access_level != 'admin' AND requesting_user_email != 'vito@teaminova.com' THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  
  -- Delete the profile (this cascades to related data)
  DELETE FROM profiles WHERE user_id = user_id_to_delete;
  
  RETURN TRUE;
END;
$$;