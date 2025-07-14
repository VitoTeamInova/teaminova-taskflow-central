import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Mail, Shield, ShieldCheck } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Profile {
  id: string;
  name: string;
  email: string;
  access_level: string;
  created_at: string;
  user_id: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

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

  // Check if current user has admin access
  const currentUserProfile = users.find(u => u.user_id === user?.id);
  const isAdmin = currentUserProfile?.email === 'vito@teaminova.com' || currentUserProfile?.access_level === 'admin';

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to access user management.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading users...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {users.map((profile) => (
          <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{profile.name}</h4>
                <Badge variant={profile.access_level === 'admin' ? 'default' : 'secondary'}>
                  {profile.access_level}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-muted-foreground">
                Joined: {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Select
                  value={profile.access_level || 'user'}
                  onValueChange={(value) => updateUserAccessLevel(profile.user_id, value)}
                  disabled={actionLoading === profile.user_id || profile.user_id === user?.id}
                >
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        User
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => sendPasswordReset(profile.email, profile.user_id)}
                disabled={actionLoading === profile.user_id}
              >
                {actionLoading === profile.user_id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Reset Password
              </Button>
              
              {profile.user_id !== user?.id && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={actionLoading === profile.user_id}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {profile.name} ({profile.email})? 
                        This action cannot be undone and will permanently remove their account and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteUser(profile.user_id, profile.email)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete User
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        ))}
        
        {users.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No users found.
          </p>
        )}
      </CardContent>
    </Card>
  );
}