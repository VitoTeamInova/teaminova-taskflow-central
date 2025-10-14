import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AppRole, UserRole } from '@/types/user';
import { errorLogger } from '@/lib/errorLogger';

export function useRoleManagement() {
  const [userRoles, setUserRoles] = useState<Record<string, AppRole[]>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group roles by user_id
      const rolesByUser: Record<string, AppRole[]> = {};
      (data || []).forEach((role: UserRole) => {
        if (!rolesByUser[role.user_id]) {
          rolesByUser[role.user_id] = [];
        }
        rolesByUser[role.user_id].push(role.role);
      });

      setUserRoles(rolesByUser);
    } catch (error: any) {
      errorLogger.logDatabaseError("Error fetching roles", error, { scope: "useRoleManagement.fetchUserRoles" });
      toast({
        variant: "destructive",
        title: "Error fetching roles",
        description: error?.message || "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: AppRole): Promise<boolean> => {
    setActionLoading(userId);
    try {
      // Try to update existing role first
      const { data: existingRoles, error: fetchError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (fetchError) {
        throw fetchError;
      }

      if (existingRoles && existingRoles.length > 0) {
        // Update existing role
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Insert new role if none exists
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });

        if (insertError) {
          throw insertError;
        }
      }

      // Refresh roles for UI
      await fetchUserRoles();
      return true;
    } catch (error: any) {
      // Log centrally and surface a helpful message
      errorLogger.logDatabaseError("Error updating user role", error, { userId, newRole });
      const isForbidden = (error?.status === 403) || (error?.code === 'PGRST301') || error?.message?.includes('permission');
      toast({
        variant: "destructive",
        title: "Role update failed",
        description: isForbidden
          ? "You don't have permission to change roles. Please contact an administrator."
          : (error?.message || "Unexpected error"),
      });
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  const addUserRole = async (userId: string, role: AppRole) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) throw error;

      toast({
        title: "Role added",
        description: `Added ${role.replace('_', ' ')} role`,
      });

      await fetchUserRoles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding role",
        description: error.message,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const removeUserRole = async (userId: string, role: AppRole) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      toast({
        title: "Role removed",
        description: `Removed ${role.replace('_', ' ')} role`,
      });

      await fetchUserRoles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error removing role",
        description: error.message,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getUserPrimaryRole = (userId: string): AppRole => {
    const roles = userRoles[userId] || [];
    
    // Priority order for displaying primary role
    if (roles.includes('administrator')) return 'administrator';
    if (roles.includes('project_manager')) return 'project_manager';
    if (roles.includes('dev_lead')) return 'dev_lead';
    if (roles.includes('developer')) return 'developer';
    if (roles.includes('product_owner')) return 'product_owner';
    return 'team_member';
  };

  const hasRole = (userId: string, role: AppRole): boolean => {
    return (userRoles[userId] || []).includes(role);
  };

  const isAdmin = (userId: string): boolean => {
    return hasRole(userId, 'administrator');
  };

  useEffect(() => {
    fetchUserRoles();
  }, []);

  return {
    userRoles,
    loading,
    actionLoading,
    updateUserRole,
    addUserRole,
    removeUserRole,
    getUserPrimaryRole,
    hasRole,
    isAdmin,
    fetchUserRoles
  };
}
