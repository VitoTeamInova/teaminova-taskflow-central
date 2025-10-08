import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, Mail, Shield, ShieldCheck, Eye, EyeOff } from 'lucide-react';
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
import { Profile } from '@/types/user';
import { useEmailVisibility, maskEmail } from '@/hooks/useEmailVisibility';

interface UserCardProps {
  profile: Profile;
  currentUserId?: string;
  actionLoading: string | null;
  onPasswordReset: (email: string, userId: string) => void;
  onDelete: (userId: string, userEmail: string) => void;
  onAccessLevelChange: (userId: string, newAccessLevel: string) => void;
}

export function UserCard({
  profile,
  currentUserId,
  actionLoading,
  onPasswordReset,
  onDelete,
  onAccessLevelChange
}: UserCardProps) {
  const { canViewEmail } = useEmailVisibility(profile.user_id);
  const displayEmail = canViewEmail ? profile.email : maskEmail(profile.email);

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{profile.name}</h4>
          <Badge variant={profile.access_level === 'admin' ? 'default' : 'secondary'}>
            {profile.access_level}
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
            value={profile.access_level || 'user'}
            onValueChange={(value) => onAccessLevelChange(profile.user_id, value)}
            disabled={actionLoading === profile.user_id || profile.user_id === currentUserId}
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