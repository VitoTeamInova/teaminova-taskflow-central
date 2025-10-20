import { Bell, User, LogOut, Settings, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useMemo } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Project } from "@/types/task";

interface HeaderProps {
  onViewChange: (view: string) => void;
  onSettingsClick: () => void;
  onCreateProject: () => void;
  projects: Project[];
  activeView: string;
}

export function Header({ onViewChange, onSettingsClick, onCreateProject, projects, activeView }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { tasks } = useSupabaseData();
  const [dialogOpen, setDialogOpen] = useState(false);

  const criticalOverdueTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      if (task.status === 'completed' || task.status === 'cancelled') return false;
      if (!task.due_date) return false;
      
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate < today && (task.priority === 'critical' || task.priority === 'high');
    });
  }, [tasks]);

  return (
    <header className="border-b bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TI</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">TeamInova</h1>
              <p className="text-xs text-muted-foreground">Task Management</p>
            </div>
          </div>

          <nav className="flex items-center space-x-1">
            <Button
              variant="ghost"
              onClick={() => onViewChange('dashboard')}
              className={activeView === 'dashboard' ? 'bg-muted' : ''}
            >
              Dashboard
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1">
                  Projects
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[300px]">
                <DropdownMenuItem
                  onClick={() => {
                    onCreateProject();
                    onViewChange('projects');
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <DropdownMenuItem
                      key={project.id}
                      onClick={() => onViewChange(`project-${project.id}`)}
                    >
                      {project.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="px-2 py-4 text-sm text-muted-foreground">No projects yet</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1">
                  Tasks
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuItem onClick={() => onViewChange('tasks')}>
                  Kanban View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange('task-list')}>
                  List View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange('calendar')}>
                  Calendar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1">
                  Team
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuItem onClick={() => onViewChange('team')}>
                  Card View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange('team-list')}>
                  List View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1">
                  Issues
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[220px]">
                <DropdownMenuItem
                  onClick={() => {
                    setDialogOpen(true);
                    onViewChange('issues-all');
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Issue
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onViewChange('issues-by-project')}>
                  Issues by Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange('issues-by-severity')}>
                  Issues by Severity
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange('issues-by-date')}>
                  Issues by Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange('issues-by-owner')}>
                  Issues by Owner
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => onViewChange('overdue-tasks')}
            title="Critical overdue tasks"
          >
            <Bell className="h-5 w-5" />
            {criticalOverdueTasks.length > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                {criticalOverdueTasks.length}
              </Badge>
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.user_metadata?.name || user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" onClick={onSettingsClick} title="Settings">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}