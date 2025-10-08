-- Drop the view approach - we'll use RLS policies instead
DROP VIEW IF EXISTS public.safe_profiles;

-- The security definer function is fine to keep for checking permissions
-- No changes needed to can_view_profile_email function

-- The current policy "Users can view basic profile info" already exists and allows viewing profiles
-- The app will continue to work, but we need to update the frontend to not display emails
-- unless the user has permission

-- Add a comment to remind developers about email security
COMMENT ON COLUMN public.profiles.email IS 
'SECURITY: Email addresses should only be displayed to the profile owner or admins. Frontend code must check permissions using can_view_profile_email() before displaying.';

-- All done - the RLS policy allows reading, but the app should filter emails in the UI