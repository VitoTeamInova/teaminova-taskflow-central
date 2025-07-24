-- SECURITY FIXES - Address critical vulnerabilities identified in security review

-- 1. FIX CRITICAL PRIVILEGE ESCALATION: Users can self-promote to admin
-- Drop the overly permissive profile update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create separate policies for regular fields vs privileged fields
CREATE POLICY "Users can update non-privileged profile fields" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  -- Prevent users from changing their access_level
  (OLD.access_level = NEW.access_level OR OLD.access_level IS NULL)
);

-- Only admins can update access levels
CREATE POLICY "Admins can update access levels" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND (p.access_level = 'admin' OR p.email = 'vito@teaminova.com')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND (p.access_level = 'admin' OR p.email = 'vito@teaminova.com')
  )
);

-- 2. FIX DATABASE FUNCTION SEARCH PATHS (Security vulnerability)
-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 3. CREATE SECURE ADMIN CHECK FUNCTION
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid 
    AND (access_level = 'admin' OR email = 'vito@teaminova.com')
  );
$$;