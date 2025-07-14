import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { UserCard } from '@/components/UserCard';

export function UserManagement() {
  const { user } = useAuth();
  const {
    users,
    loading,
    actionLoading,
    sendPasswordReset,
    deleteUser,
    updateUserAccessLevel
  } = useUserManagement();

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
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {users.map((profile) => (
          <UserCard
            key={profile.id}
            profile={profile}
            currentUserId={user?.id}
            actionLoading={actionLoading}
            onPasswordReset={sendPasswordReset}
            onDelete={deleteUser}
            onAccessLevelChange={updateUserAccessLevel}
          />
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