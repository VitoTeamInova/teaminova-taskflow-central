import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@/types/user';

export function useUserManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching users",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string, userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) throw error;

      toast({
        title: "Password reset sent",
        description: `Password reset email sent to ${email}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sending password reset",
        description: error.message,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    setActionLoading(userId);
    try {
      // Only delete the profile - this will trigger auth user deletion via RLS
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;

      toast({
        title: "User deleted",
        description: `User ${userEmail} has been deleted successfully`,
      });

      // Refresh the users list
      await fetchUsers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting user",
        description: error.message,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const updateUserAccessLevel = async (userId: string, newAccessLevel: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ access_level: newAccessLevel })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Access level updated",
        description: `User access level changed to ${newAccessLevel}`,
      });

      // Refresh the users list
      await fetchUsers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating access level",
        description: error.message,
      });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    actionLoading,
    sendPasswordReset,
    deleteUser,
    updateUserAccessLevel,
    fetchUsers
  };
}