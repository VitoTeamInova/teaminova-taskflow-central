import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, Mail, Shield, Users, Briefcase, Code, User, EyeOff } from 'lucide-react';
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
import { Profile, AppRole } from '@/types/user';
import { useEmailVisibility, maskEmail } from '@/hooks/useEmailVisibility';
import { supabase } from '@/integrations/supabase/client';

interface UserCardProps {
  profile: Profile;
  currentUserId?: string;
  actionLoading: string | null;
  onPasswordReset: (email: string, userId: string) => void;
  onDelete: (userId: string, userEmail: string) => void;
  onRoleChange: (userId: string, newRole: AppRole) => void;
}

const roleIcons = {
  administrator: Shield,
  project_manager: Briefcase,
  dev_lead: Code,
  developer: Code,
  product_owner: Users,
  team_member: User,
};

const roleLabels = {
  administrator: 'Administrator',
  project_manager: 'Project Manager',
  dev_lead: 'Dev Lead/Architect',
  developer: 'Developer',
  product_owner: 'Product Owner',
  team_member: 'Team Member',
};

export function UserCard({
  profile,
  currentUserId,
  actionLoading,
  onPasswordReset,
  onDelete,
  onRoleChange
}: UserCardProps) {
  const { canViewEmail } = useEmailVisibility(profile.user_id);
  const displayEmail = canViewEmail ? profile.email : maskEmail(profile.email);
  const [userRole, setUserRole] = useState<AppRole>('team_member');

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profile.user_id)
        .single();
      
      if (data) {
        setUserRole(data.role as AppRole);
      }
    };
    
    fetchUserRole();
  }, [profile.user_id]);

  const RoleIcon = roleIcons[userRole];

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{profile.name}</h4>
          <Badge variant={userRole === 'administrator' ? 'default' : 'secondary'}>
            <RoleIcon className="h-3 w-3 mr-1" />
            {roleLabels[userRole]}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">{displayEmail}</p>
          {!canViewEmail && (
            <span title="Email hidden for privacy">
              <EyeOff className="h-3 w-3 text-muted-foreground" />
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Joined: {new Date(profile.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Select
            value={userRole}
            onValueChange={(value) => onRoleChange(profile.user_id, value as AppRole)}
            disabled={actionLoading === profile.user_id || profile.user_id === currentUserId}
          >
            <SelectTrigger className="w-48 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(roleLabels).map(([value, label]) => {
                const Icon = roleIcons[value as AppRole];
                return (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-3 w-3" />
                      {label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPasswordReset(profile.email, profile.user_id)}
          disabled={actionLoading === profile.user_id}
        >
          {actionLoading === profile.user_id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          Reset Password
        </Button>
        
        {profile.user_id !== currentUserId && (
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
                  onClick={() => onDelete(profile.user_id, profile.email)}
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
  );
}