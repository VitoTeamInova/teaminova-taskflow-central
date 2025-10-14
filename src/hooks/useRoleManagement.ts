import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AppRole, UserRole } from '@/types/user';

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
      toast({
        variant: "destructive",
        title: "Error fetching roles",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: AppRole) => {
    setActionLoading(userId);
    try {
      // First, remove all existing roles for this user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Then add the new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (insertError) throw insertError;

      toast({
        title: "Role updated",
        description: `User role changed to ${newRole.replace('_', ' ')}`,
      });

      await fetchUserRoles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating role",
        description: error.message,
      });
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
