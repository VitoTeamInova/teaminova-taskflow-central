import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/task";
import { UserManagement } from "./UserManagement";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
}

export function SettingsDialog({ open, onOpenChange, projects }: SettingsDialogProps) {
  const { defaultProjectId, setDefaultProjectId } = useSettings();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  // Add safety check for theme
  const isDarkMode = theme === 'dark';
  const effectiveTheme = theme || 'light';

  const handleThemeToggle = (checked: boolean) => {
    console.log('Theme toggle clicked, checked:', checked);
    setTheme(checked ? 'dark' : 'light');
  };

  // Fetch current user profile to check access level
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setCurrentUserProfile(data);
      }
    };
    fetchUserProfile();
  }, [user]);

  // Check if user has admin access
  const isAdmin = currentUserProfile?.email === 'vito@teaminova.com' || currentUserProfile?.access_level === 'admin';

  // Debug logging
  console.log('SettingsDialog render:', { open, theme, isDarkMode, projects: projects.length });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={showUserManagement ? "sm:max-w-[800px]" : "sm:max-w-[425px]"}>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        {showUserManagement ? (
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => setShowUserManagement(false)}
              className="mb-4"
            >
              ← Back to Settings
            </Button>
            <UserManagement />
          </div>
        ) : (
          <div className="space-y-6 py-4">
          {/* Dark/Light Mode Toggle */}
          <div className="space-y-2">
            <Label htmlFor="theme-toggle" className="text-sm font-medium">
              Appearance
            </Label>
            <div className="flex items-center space-x-2">
              <Label htmlFor="theme-toggle" className="text-sm text-muted-foreground">
                Light
              </Label>
              <Switch
                id="theme-toggle"
                checked={isDarkMode}
                onCheckedChange={handleThemeToggle}
              />
              <Label htmlFor="theme-toggle" className="text-sm text-muted-foreground">
                Dark
              </Label>
            </div>
          </div>

          {/* Default Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="default-project" className="text-sm font-medium">
              Default Project
            </Label>
            <p className="text-xs text-muted-foreground">
              Set a default project for new tasks. This can be changed when creating tasks.
            </p>
            <Select value={defaultProjectId || "none"} onValueChange={(value) => setDefaultProjectId(value === "none" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a default project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No default project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User Management - Only show for admins */}
          {isAdmin && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Administration
              </Label>
              <p className="text-xs text-muted-foreground">
                Manage user accounts and permissions.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowUserManagement(true)}
              >
                Manage User Accounts
              </Button>
            </div>
          )}
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}