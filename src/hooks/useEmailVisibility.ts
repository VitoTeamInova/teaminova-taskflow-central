import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook to check if the current user can view a specific profile's email
 * Uses the can_view_profile_email security definer function
 */
export function useEmailVisibility(profileUserId: string | undefined | null) {
  const { user } = useAuth();
  const [canViewEmail, setCanViewEmail] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEmailVisibility = async () => {
      if (!user || !profileUserId) {
        setCanViewEmail(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('can_view_profile_email', {
          profile_user_id: profileUserId
        });

        if (error) {
          console.error('Error checking email visibility:', error);
          setCanViewEmail(false);
        } else {
          setCanViewEmail(data || false);
        }
      } catch (error) {
        console.error('Error in email visibility check:', error);
        setCanViewEmail(false);
      } finally {
        setLoading(false);
      }
    };

    checkEmailVisibility();
  }, [user, profileUserId]);

  return { canViewEmail, loading };
}

/**
 * Helper function to mask email addresses
 */
export function maskEmail(email: string): string {
  if (!email) return '';
  const [username, domain] = email.split('@');
  if (!domain) return email;
  
  const visibleChars = Math.min(3, Math.floor(username.length / 2));
  const maskedUsername = username.substring(0, visibleChars) + '***';
  return `${maskedUsername}@${domain}`;
}
