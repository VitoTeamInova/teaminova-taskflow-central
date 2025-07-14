-- Add access_level column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN access_level text DEFAULT 'user' CHECK (access_level IN ('admin', 'user'));

-- Update the existing vito@teaminova.com user to be admin if exists
UPDATE public.profiles 
SET access_level = 'admin' 
WHERE email = 'vito@teaminova.com';