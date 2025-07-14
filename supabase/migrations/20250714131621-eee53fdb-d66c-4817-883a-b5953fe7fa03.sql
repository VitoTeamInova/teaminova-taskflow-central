-- Add DELETE policy for profiles table to allow admins to delete users
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

-- Also add policy to allow admins to update any profile's access level
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND (p.access_level = 'admin' OR p.email = 'vito@teaminova.com')
  )
);