import React from 'react';
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
import { useSettings } from "@/contexts/SettingsContext";
import { useTheme } from "next-themes";
import { Project } from "@/types/task";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
}

export function SettingsDialog({ open, onOpenChange, projects }: SettingsDialogProps) {
  const { defaultProjectId, setDefaultProjectId } = useSettings();
  const { theme, setTheme } = useTheme();

  // Add safety check for theme
  const isDarkMode = theme === 'dark';
  const effectiveTheme = theme || 'light';

  const handleThemeToggle = (checked: boolean) => {
    console.log('Theme toggle clicked, checked:', checked);
    setTheme(checked ? 'dark' : 'light');
  };

  // Debug logging
  console.log('SettingsDialog render:', { open, theme, isDarkMode, projects: projects.length });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
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
            <Select value={defaultProjectId} onValueChange={setDefaultProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a default project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No default project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}