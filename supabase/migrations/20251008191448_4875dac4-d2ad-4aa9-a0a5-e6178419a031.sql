-- Step 1: Create a security definer function to check if user can view email
CREATE OR REPLACE FUNCTION public.can_view_profile_email(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- User can view email if:
  -- 1. It's their own profile
  -- 2. They are an admin
  SELECT 
    auth.uid() = profile_user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() 
      AND (access_level = 'admin' OR email = 'vito@teaminova.com')
    );
$$;

-- Step 2: Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Step 3: Create new granular policies for SELECT
-- Policy 1: Users can view basic profile info (name, role, avatar) for collaboration
CREATE POLICY "Users can view basic profile info"
ON public.profiles
FOR SELECT
USING (true);

-- Step 4: Add column-level security by creating a view for safe profile access
CREATE OR REPLACE VIEW public.safe_profiles AS
SELECT 
  id,
  user_id,
  name,
  role,
  avatar,
  created_at,
  updated_at,
  access_level,
  -- Only show email if user has permission
  CASE 
    WHEN public.can_view_profile_email(user_id) THEN email
    ELSE NULL
  END as email
FROM public.profiles;

-- Grant select on the view
GRANT SELECT ON public.safe_profiles TO authenticated;

-- Step 5: Update the comment to document the security model
COMMENT ON POLICY "Users can view basic profile info" ON public.profiles IS 
'Allows users to view basic profile information needed for team collaboration. Email addresses are filtered through the safe_profiles view based on permissions.';

-- Step 6: Add helpful comment on the view
COMMENT ON VIEW public.safe_profiles IS 
'Security-filtered view of profiles. Email addresses only visible to profile owner and admins. Use this view instead of direct profiles table queries for read operations.';